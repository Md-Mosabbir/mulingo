const conversations = [
  {
    id: "c1",
    name: "John Doe",
    preview: "How's going with your property search?",
    time: "4:45 pm",
    status: "online",
    avatar: "JD",
  },
  {
    id: "c2",
    name: "Travis Barker",
    preview: "... is typing",
    time: "5:38 pm",
    status: "typing",
    avatar: "TB",
  },
  {
    id: "c3",
    name: "Kate Rose",
    preview: "Looking forward to discussing real estate.",
    time: "5:04 pm",
    status: "seen",
    avatar: "KR",
  },
  {
    id: "c4",
    name: "Robert Parker",
    preview: "That's fantastic news about the new listing.",
    time: "4:22 pm",
    status: "unread",
    avatar: "RP",
  },
  {
    id: "c5",
    name: "Emily Johnson",
    preview: "Take a look at my recent real estate post...",
    time: "3:59 pm",
    status: "seen",
    avatar: "EJ",
  },
  {
    id: "c6",
    name: "Sophia Brown",
    preview: "Discover amazing properties on my page!",
    time: "3:24 pm",
    status: "seen",
    avatar: "SB",
  },
];

const messagesByConversation = {
  c1: [
    {
      id: "m1",
      sender: "agent",
      text: "I'm a manager that's here to help",
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
