const conversations = [
  {
    id: "c1",
    name: "John Doe",
    language: "English",
    preview: "How's going with your property search?",
    time: "4:45 pm",
    status: "online",
    avatar: "JD",
    sharedItems: [
      { id: "s1", type: "image", name: "living-room-shot.png" },
      { id: "s2", type: "video", name: "walkthrough-tour.mp4" },
      { id: "s3", type: "file", name: "property-specs.pdf" },
    ],
  },
  {
    id: "c2",
    name: "Travis Barker",
    language: "German",
    preview: "... is typing",
    time: "5:38 pm",
    status: "typing",
    avatar: "TB",
    sharedItems: [{ id: "s4", type: "file", name: "booking-terms.docx" }],
  },
  {
    id: "c3",
    name: "Kate Rose",
    language: "French",
    preview: "Looking forward to discussing real estate.",
    time: "5:04 pm",
    status: "seen",
    avatar: "KR",
    sharedItems: [],
  },
  {
    id: "c4",
    name: "Robert Parker",
    language: "Spanish",
    preview: "That's fantastic news about the new listing.",
    time: "4:22 pm",
    status: "unread",
    avatar: "RP",
    sharedItems: [{ id: "s5", type: "video", name: "promo-clip.mov" }],
  },
  {
    id: "c5",
    name: "Emily Johnson",
    language: "Japanese",
    preview: "Take a look at my recent real estate post...",
    time: "3:59 pm",
    status: "seen",
    avatar: "EJ",
    sharedItems: [{ id: "s6", type: "image", name: "kitchen-remodel.jpg" }],
  },
  {
    id: "c6",
    name: "Sophia Brown",
    language: "Arabic",
    preview: "Discover amazing properties on my page!",
    time: "3:24 pm",
    status: "seen",
    avatar: "SB",
    sharedItems: [],
  },
];

const messagesByConversation = {
  c1: [
    {
      id: "m1",
      sender: "agent",
      text: "I don't wanna sin anymore. I have seen so much death that the feeling is close.",
      originalText: "Hallo! sehr sehr schon fur mich! Leute Leute sehr sehr. Ich kann das nicht verstehen mew mew leute leute",
      time: "9:37 am",
    },
    {
      id: "m2",
      sender: "agent",
      type: "property",
      text: "This is a modern townhouse in a quiet neighborhood.",
      stats: [
        { label: "Daily Visitors", value: "2,429" },
        { label: "Building Age", value: "3Y" },
        { label: "Temperature", value: "28°F" },
      ],
      photos: ["Living Room", "Kitchen", "Bath 3+"],
      time: "11:11 am",
    },
    {
      id: "m3",
      sender: "user",
      text: "Looks good 👍🏻. I want to sign up for a viewing",
      time: "12:25 pm",
    },
    {
      id: "m4",
      sender: "agent",
      text: "What day and time works best for you to come by for the viewing?",
      time: "12:57 pm",
    },
  ],
};

export async function fetchConversations() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(conversations), 200);
  });
}

export async function fetchMessages(conversationId) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(messagesByConversation[conversationId] ?? []), 200);
  });
}
