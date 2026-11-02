import Link from "next/link";
import { StaticPage } from "./static-pages";

export interface BlogSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface BlogPost {
  slug: string;
  category: string;
  title: string;
  description: string;
  readTime: string;
  takeaways: string[];
  introduction: string;
  sections: BlogSection[];
  tags: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "new-noida-explained",
    category: "New Noida",
    title: "New Noida Explained: What It Is, Where It Is and What It Means for Buyers",
    description: "A plain-language guide to New Noida (DNGIR) and its Master Plan 2041, with what homebuyers should verify.",
    readTime: "6 min read",
    takeaways: [
      "New Noida is the popular name for the Dadri-Noida-Ghaziabad Investment Region (DNGIR), a separate planned region.",
      "Its Master Plan 2041 was approved in October 2024 and covers about 80 villages and roughly 209 sq km.",
      "Development is planned in four phases up to 2041. These are targets, not completed work.",
    ],
    introduction:
      'You may have heard "New Noida" in news, ads and property pitches. Here is what it actually means, in simple words, and what to check before you act on it.',
    sections: [
      {
        heading: "What is New Noida?",
        paragraphs: [
          "New Noida is the commonly used name for the Dadri-Noida-Ghaziabad Investment Region (DNGIR), a planned, industry-led urban region across parts of the Gautam Buddh Nagar and Bulandshahr districts. The master plan was prepared by Noida Authority. It is separate from the Greater Noida master plan, which is run by a different authority.",
        ],
      },
      {
        heading: "Key facts at a glance",
        bullets: [
          "Plan: New Noida Master Plan 2041.",
          "Approved: 18 October 2024 by the Uttar Pradesh government.",
          "Area: about 20,900 hectares (roughly 209 sq km).",
          "Villages: about 80 (some reports mention 84).",
          "Focus: manufacturing and logistics, along with residential, commercial and green zones.",
        ],
      },
      {
        heading: "How the plan is meant to roll out",
        paragraphs: [
          "The plan is divided into four phases up to 2041. The first phase targets around 3,165 hectares by 2027, followed by later phases to 2032, 2037 and 2041. Recent reports say land acquisition has begun in the first set of villages. Remember that these milestones are planning targets, and real timelines can shift.",
        ],
      },
      {
        heading: "What it means for homebuyers",
        bullets: [
          "New Noida is an investment region, not a ready housing township. Do not confuse the master plan with a finished neighbourhood.",
          "Township approval and a project's RERA registration are different things. Verify each project on the UP-RERA portal.",
          "Be careful with land or plot offers inside the planning area. Check the current registration position at the sub-registrar's office before paying anything.",
          "Compare it with established sectors on commute, social infrastructure and delivery timelines.",
        ],
        paragraphs: ["For a step-by-step list, read our RERA checklist for first-time buyers."],
      },
      {
        heading: "Where to check official information",
        paragraphs: [
          "Follow notices from Noida Authority and the Uttar Pradesh government, and use the official UP-RERA website for project registrations.",
          "Details are based on publicly reported information as of 2 November 2026 and may change. Please confirm with official sources.",
        ],
      },
    ],
    tags: ["New Noida", "DNGIR", "Master Plan 2041", "Real estate"],
  },
  {
    slug: "noida-at-50",
    category: "Noida Updates",
    title: "Noida at 50: How a Planned Township Became a Major Urban Hub",
    description: "From an industrial township set up in 1976 to a city of offices, homes, malls and media, a quick look at Noida's journey.",
    readTime: "4 min read",
    takeaways: [
      "Noida was established on 17 April 1976 and takes its name from the New Okhla Industrial Development Authority.",
      "It began as an industrial township and now mixes homes, offices, schools, media and retail.",
      "Its growth now extends to Greater Noida, Greater Noida West and the planned New Noida.",
    ],
    introduction: "In 2026, Noida completes 50 years. A city that started as a planned industrial township is now one of the most talked-about urban areas in the Delhi NCR.",
    sections: [
      {
        heading: "From industrial township to city",
        paragraphs: ["Noida was set up on 17 April 1976, and its name comes from the New Okhla Industrial Development Authority. The idea was a planned township next to Delhi, with industry at its core."],
      },
      {
        heading: "A city of sectors",
        paragraphs: ["Noida was laid out in numbered sectors, each with its own mix of housing, markets and open spaces. This planned layout is still one of the things residents value most."],
      },
      {
        heading: "How daily life changed",
        bullets: [
          "Offices, IT and electronics companies and a media cluster joined the original industries.",
          "Residential sectors and high-rise societies grew around them.",
          "Malls, schools, hospitals and metro connectivity made the city a place to live, not just work.",
        ],
      },
      {
        heading: "What comes next",
        paragraphs: ["Growth is now spreading to Greater Noida and Greater Noida West, and a new planned region, often called New Noida, is on the map."],
      },
    ],
    tags: ["Noida", "History", "City growth"],
  },
  {
    slug: "aoa-rwa-resident-guide",
    category: "Society Updates",
    title: "Living in a Noida Society: A Resident's Guide to AOA, RWA and Maintenance",
    description: "How resident bodies work, what to ask about maintenance charges and how to raise complaints the right way.",
    readTime: "5 min read",
    takeaways: [
      "In many apartment complexes owners form an AOA, while colonies and sectors often have an RWA.",
      "Ask for an itemised maintenance break-up and read your society's bylaws.",
      "Put complaints in writing, keep records and escalate step by step.",
    ],
    introduction: "Most people in Noida live in a society or a sector with a resident body. Knowing how it works makes everyday living much smoother.",
    sections: [
      {
        heading: "AOA and RWA: what is the difference?",
        paragraphs: ["In many apartment complexes, flat owners form an Apartment Owners' Association (AOA) to manage common areas and services. In colonies and sectors, a Resident Welfare Association (RWA) usually represents residents. Your society's bylaws explain who does what."],
      },
      {
        heading: "Know your documents",
        bullets: ["Builder-buyer agreement and maintenance agreement.", "Society bylaws and the rules for committee elections.", "Minutes of recent general meetings."],
      },
      {
        heading: "Understand maintenance charges",
        paragraphs: ["Ask for an itemised break-up covering security, housekeeping, power backup, lift upkeep and sinking fund. Residents can ask to see audited accounts at the annual general meeting."],
      },
      {
        heading: "Attend meetings and vote",
        paragraphs: ["General meetings are where budgets, rule changes and committee decisions are made. Attending is the easiest way to be heard."],
      },
      {
        heading: "Raise complaints the right way",
        bullets: [
          "Write to the facility manager or committee and keep a copy.",
          "Follow up in writing if there is no reply in a reasonable time.",
          "For project-related issues, approach the builder or the relevant authority, and UP-RERA where it applies.",
        ],
        paragraphs: ["This is general information, not legal advice."],
      },
    ],
    tags: ["Society", "AOA", "RWA", "Maintenance"],
  },
  {
    slug: "weekend-ideas-noida",
    category: "Lifestyle",
    title: "Weekend Ideas in Noida for Families and Friends",
    description: "Nature, malls, markets and street food: easy plans for a weekend without leaving the city.",
    readTime: "4 min read",
    takeaways: [
      "Mix a nature outing, a mall visit and a food stop for an easy weekend.",
      "Go early on weekends to avoid crowds and traffic.",
      "Always check timings and entry rules before you leave.",
    ],
    introduction: "You do not need a long drive for a good weekend. Noida has something for every mood. Here are a few easy ideas.",
    sections: [
      {
        heading: "For nature and a slow morning",
        paragraphs: ["Okhla Bird Sanctuary, on the Noida-Delhi border, is a popular spot for birdwatching and a calm walk, especially early in the day. Many sector parks also work well for a quick family outing."],
      },
      {
        heading: "For shopping and entertainment",
        bullets: ["DLF Mall of India in Sector 18 for shopping, cinema and dining.", "Great India Place and Worlds of Wonder near Sector 38A for a family day out."],
      },
      {
        heading: "For food and markets",
        paragraphs: ["Sector 18's market and Atta Market are well-known places for street food, snacks and local shopping. Go in the evening for the full atmosphere."],
      },
      {
        heading: "Plan it well",
        bullets: ["Check opening hours and entry rules before you leave.", "Travel early on weekends to beat traffic and crowds.", "Use the metro where it is convenient."],
      },
    ],
    tags: ["Weekend", "Family", "Food", "Things to do"],
  },
  {
    slug: "wedding-venue-checklist",
    category: "Wedding",
    title: "How to Choose a Wedding Venue in Noida: A Practical Checklist",
    description: "Banquet halls, lawns, farmhouses or resorts? Here is how to compare venues in Noida before you book.",
    readTime: "5 min read",
    takeaways: [
      "Fix guest count and budget before you visit venues.",
      "Compare venue types for weather, space and cost.",
      "Ask about decor, caterer, power backup and cancellation terms before you book.",
    ],
    introduction: "Noida and Greater Noida have a wide mix of banquet halls, lawns, farmhouses and hotel venues. The right choice depends on your guest count, budget, season and logistics. Use this checklist to compare options calmly.",
    sections: [
      {
        heading: "Start with guest count and budget",
        paragraphs: ["Fix a realistic guest count first, then ask every venue whether pricing is per plate or a flat rental, and exactly what is included (decor, rooms, power backup, parking)."],
      },
      {
        heading: "Compare venue types",
        bullets: [
          "Banquet halls: usually weather-proof and air-conditioned, and easy for city guests to reach.",
          "Lawns and farmhouses: more open space for the baraat and functions, but you need a backup plan for rain and heat.",
          "Hotels and resorts: everything in one place, with rooms for out-of-town family, often at a higher price.",
        ],
      },
      {
        heading: "Check location and access",
        paragraphs: ["Look at parking space, distance from the main road or metro, traffic on peak wedding dates, and whether there is room for the baraat entry and DJ."],
      },
      {
        heading: "Questions to ask before you book",
        bullets: [
          "Is the seating capacity different from the floating capacity?",
          "Can we bring our own decorator, caterer or DJ?",
          "Is there power backup, and are there any music or time limits?",
          "What are the payment schedule and cancellation terms?",
          "Can we see photos or videos of real events at the venue?",
        ],
      },
      {
        heading: "Visit at the same time as your event",
        paragraphs: ["Go in the evening if your function is in the evening. Check lighting, sound, washrooms and parking when it is actually in use."],
      },
      {
        heading: "Book early",
        paragraphs: ["Good dates around popular muhurats fill up well in advance, so shortlist and confirm early."],
      },
    ],
    tags: ["Wedding", "Venues", "Checklist"],
  },
  {
    slug: "buying-flat-rera-checklist",
    category: "Real Estate",
    title: "Buying a Flat in Noida: A RERA Checklist for First-Time Buyers",
    description: "A simple checklist to verify the project, the builder and the paperwork before you pay.",
    readTime: "6 min read",
    takeaways: [
      "Verify the project's UP-RERA registration number first.",
      "Check approvals, builder track record and the full cost sheet.",
      "Have a lawyer review the agreement before you sign.",
    ],
    introduction: "Noida, Greater Noida and Greater Noida West have many new projects, so first-time buyers should verify before they pay. Projects here come under Uttar Pradesh RERA (UP-RERA). This checklist covers the basics.",
    sections: [
      {
        heading: "1. Verify the RERA registration",
        paragraphs: ["Ask for the project's RERA number and check it on the official UP-RERA website. Match the project name, promoter and the declared completion date."],
      },
      {
        heading: "2. Check the builder's track record",
        paragraphs: ["Look at past projects, whether they were delivered on time, and speak to residents if you can."],
      },
      {
        heading: "3. Confirm land and approvals",
        paragraphs: ["Ask to see the land title, the sanctioned layout from the relevant development authority, and, for ready homes, the completion or occupancy certificate."],
      },
      {
        heading: "4. Understand the stage and timeline",
        paragraphs: ["Under-construction homes can cost less but carry delivery risk. Ready-to-move homes let you inspect what you buy. Ask for the possession date and a payment plan linked to construction stages."],
      },
      {
        heading: "5. Ask for the full cost sheet",
        paragraphs: ["Beyond the base price, check preferred location charges, parking, club membership, maintenance deposits, registration and stamp duty."],
      },
      {
        heading: "6. Read the agreement carefully",
        paragraphs: ["Understand carpet area versus super area, penalties for delay and cancellation terms. Have a property lawyer review it before you sign."],
      },
      {
        heading: "7. Visit the site and the neighbourhood",
        paragraphs: ["Check road access, water and power backup, nearby schools and hospitals, and the commute at peak hours."],
      },
      {
        heading: "8. Check home loan eligibility",
        paragraphs: ["Confirm that your bank has approved the project before you rely on a loan.", "This is general guidance, not legal advice."],
      },
    ],
    tags: ["RERA", "Home buying", "Checklist"],
  },
  {
    slug: "noida-areas-guide",
    category: "Lifestyle",
    title: "Noida, Greater Noida or Greater Noida West: Which Area Suits You?",
    description: "A simple way to compare areas by commute, budget, lifestyle and how developed they are.",
    readTime: "4 min read",
    takeaways: [
      "Noida suits those who want established sectors and metro access.",
      "Greater Noida offers wider roads and planned layouts.",
      "Greater Noida West has many newer societies, so check the specific location.",
    ],
    introduction: "Whether you are moving for work, buying a home or choosing where to run your business, the area matters. Here is a simple way to compare Noida, Greater Noida and Greater Noida West.",
    sections: [
      {
        heading: "Noida",
        paragraphs: ["Planned sectors with established markets, offices, schools and hospitals, and metro connectivity in many parts. It suits people who want everything close by and a shorter commute to Delhi and Gurugram."],
      },
      {
        heading: "Greater Noida",
        paragraphs: ["Wider roads and planned layouts, with educational institutions and industrial areas. It suits those who value space and a calmer neighbourhood and are comfortable with longer distances."],
      },
      {
        heading: "Greater Noida West",
        paragraphs: ["Also known as Noida Extension, it has a large number of newer high-rise societies. It often attracts buyers looking for modern community living, though infrastructure is still developing in places, so check the specific location."],
      },
      {
        heading: "How to decide",
        bullets: [
          "Commute: test the route at peak hours, not on a weekend.",
          "Budget: compare the total cost, not only the base price.",
          "Ready or upcoming: decide whether you can wait for a project to be delivered.",
          "Daily needs: check schools, hospitals, markets and public transport nearby.",
        ],
        paragraphs: ["Whichever area you pick, visit in person at different times of day before you decide."],
      },
    ],
    tags: ["Areas", "Living in Noida"],
  },
];

export function BlogIndexContent() {
  const [featured, ...posts] = BLOG_POSTS;

  return (
    <StaticPage
      title={
        <>
          Noida <em>Insider</em>
        </>
      }
      description="Noida updates, New Noida, society updates, lifestyle and more: local know-how for living, celebrating and doing business in Noida, Greater Noida and Greater Noida West."
      crumbLabel="Noida Insider"
    >
      <div className="static-blog">
        <Link className="static-featured static-card" href={`/blog/${featured.slug}`}>
          <div className="static-card-art static-card-featured-art">{featured.category}</div>
          <div className="static-featured-copy">
            <span className="static-category">Featured · {featured.category}</span>
            <h2>{featured.title}</h2>
            <p>{featured.description}</p>
            <small>2 November 2026 · {featured.readTime}</small>
            <span className="static-read-more">Read article</span>
          </div>
        </Link>
        <div className="static-post-grid">
          {posts.map((post) => (
            <Link className="static-card" key={post.slug} href={`/blog/${post.slug}`}>
              <div className={`static-card-art category-${post.slug}`}>{post.category}</div>
              <div className="static-card-copy">
                <span className="static-category">{post.category}</span>
                <h2>{post.title}</h2>
                <p>{post.description}</p>
                <small>2 November 2026 · {post.readTime}</small>
              </div>
            </Link>
          ))}
        </div>
        <aside className="static-callout">
          <p>
            <b>Run a business in Noida?</b> Get discovered by local customers on Noida Super Bazaar. <Link href="/">Explore the site</Link>
          </p>
        </aside>
      </div>
    </StaticPage>
  );
}

export function BlogArticle({ post }: { post: BlogPost }) {
  return (
    <StaticPage title={post.title} description={post.description} eyebrow="Noida Insider" crumbLabel={post.title}>
      <article className="static-doc static-article">
        <div className="static-article-meta">
          <span className="static-author-mark" aria-hidden>
            N
          </span>
          <div>
            <b>NSB Editorial Team</b>
            <small>Published 2 November 2026 · {post.readTime}</small>
          </div>
        </div>
        <span className="static-category">{post.category}</span>
        <aside className="static-takeaways">
          <b>Key takeaways</b>
          <ul>
            {post.takeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
        <p>{post.introduction}</p>
        {post.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && (
              <ul>
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <aside className="static-callout">
          <p>
            Find trusted local businesses across Noida, Greater Noida and Greater Noida West. <Link href="/">Explore Noida Super Bazaar</Link>
          </p>
        </aside>
        <div className="static-tags">
          {post.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="static-author">
          <b>NSB Editorial Team</b>
          <p>
            We write simple, useful guides about life and business in Noida. This article is for general information only. See our{" "}
            <Link href="/disclaimer">Disclaimer</Link>.
          </p>
        </div>
        <Link className="static-back-blog" href="/blog">
          ← Back to Noida Insider
        </Link>
      </article>
    </StaticPage>
  );
}
