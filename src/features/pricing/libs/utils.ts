import { DEFAULT_VALUES } from "@/constant/values";

export const getAbsolutePath = (path: string) => {
  if (typeof window !== "undefined") return path;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${path}`;
  return `http://localhost:${process.env.PORT ?? 3000}${path}`;
};

export const PLANS = [
  {
    name: "Free",
    slug: "free",
    userPerWorkspace: DEFAULT_VALUES.FREE_VERSION_PROJECT_COUNT_PER_WORKSPACE,
    projectPerWorkspace: DEFAULT_VALUES.FREE_VERSION_MEMBER_COUNT_PER_WORKSPACE,
    price: {
      amount: 0,
      priceIds: {
        test: "",
        production: "",
      },
    },
  },
  {
    name: "Pro",
    slug: "pro",
    userPerWorkspace: Infinity,
    projectPerWorkspace: Infinity,
    price: {
      amount: 14,
      priceIds: {
        test: process.env.TEST_KEY!,
        production: "",
      },
    },
  },
];

export const pricingItems = [
  {
    plan: "Free",
    tagline: "For small side projects.",
    features: [
      {
        text: "5 project per workspace",
        footnote: "The maximum amount of project per workspace.",
      },
      {
        text: "10 members per project",
        footnote: "The maximum amount of team member per project.",
      },
      {
        text: "1GB storage limit",
        footnote: "The maximum cloud storage.",
      },
      {
        text: "Mobile-friendly interface",
      },
      {
        text: "Higher-quality responses",
        footnote: "Better algorithmic responses for enhanced work experience",
        negative: true,
      },
      {
        text: "Priority support",
        negative: true,
      },
    ],
  },
  {
    plan: "Pro",
    tagline: "For larger projects with higher needs.",
    features: [
      {
        text: "Unlimited projects per workspace",
        footnote: "The maximum amount of project per workspace.",
      },
      {
        text: "Unlimited members per project",
        footnote: "The maximum amount of team member per project.",
      },
      {
        text: "10GB storage limit",
        footnote: "The maximum cloud storage.",
      },
      {
        text: "Mobile-friendly interface",
      },
      {
        text: "Higher-quality responses",
        footnote: "Better algorithmic responses for enhanced content quality",
      },
      {
        text: "Priority support",
      },
    ],
  },
];
