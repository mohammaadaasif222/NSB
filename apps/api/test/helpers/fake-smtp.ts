import net from 'node:net';

export interface ReceivedMail {
  to: string[];
  /** Raw message, with quoted-printable soft line breaks removed so text can be searched. */
  data: string;
}

/**
 * A minimal SMTP server on 127.0.0.1 that accepts every message (no TLS, no auth), so tests
 * can check real nodemailer output without sending anything over the network.
 */
export async function startFakeSmtp() {
  const mails: ReceivedMail[] = [];
  const sockets = new Set<net.Socket>();
  const server = net.createServer((socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
    socket.setEncoding('utf8');
    let buffer = '';
    let inData = false;
    let to: string[] = [];
    let data = '';
    const reply = (line: string) => socket.write(`${line}\r\n`);
    reply('220 fake-smtp ready');
    socket.on('data', (chunk: string) => {
      buffer += chunk;
      for (let i = buffer.indexOf('\r\n'); i >= 0; i = buffer.indexOf('\r\n')) {
        const line = buffer.slice(0, i);
        buffer = buffer.slice(i + 2);
        if (inData) {
          if (line === '.') {
            mails.push({ to, data: data.replace(/=\n/g, '') });
            [inData, to, data] = [false, [], ''];
            reply('250 queued');
          } else {
            data += `${line.startsWith('..') ? line.slice(1) : line}\n`;
          }
          continue;
        }
        const command = line.slice(0, 4).toUpperCase();
        if (command === 'EHLO' || command === 'HELO') reply('250 fake-smtp');
        else if (command === 'RCPT') {
          to.push(/<([^>]+)>/.exec(line)?.[1] ?? '');
          reply('250 ok');
        } else if (command === 'DATA') {
          inData = true;
          reply('354 end with .');
        } else if (command === 'QUIT') {
          reply('221 bye');
          socket.end();
        } else reply('250 ok'); // MAIL, RSET, NOOP
      }
    });
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  return {
    port: (server.address() as net.AddressInfo).port,
    mails,
    /** Waits until at least `n` messages have arrived (alerts are sent after the response). */
    async waitFor(n: number, timeoutMs = 5000) {
      const until = Date.now() + timeoutMs;
      while (mails.length < n) {
        if (Date.now() > until) throw new Error(`Expected ${n} emails, got ${mails.length}`);
        await new Promise((r) => setTimeout(r, 50));
      }
      return mails;
    },
    close: () =>
      new Promise<void>((resolve) => {
        for (const s of sockets) s.destroy();
        server.close(() => resolve());
      }),
  };
}
