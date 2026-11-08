/* ============================================================
   THE ORACLE'S ANSWERS (edit freely)
   ------------------------------------------------------------
   - Each topic has "words" (what the visitor might type) and
     "answers" (what the oracle can say; one is picked at random).
   - To change an answer, just edit the text between the quotes.
   - To add a topic, copy one block { words: ..., answers: [...] },
   - Keep the quotes "..." and the commas between answers.
   ============================================================ */

window.ORACLE = {

  greeting:
    "Hello. You came in through my eye, so now I can see you from the inside. Ask me anything. I always have an answer.",

  /* The third question: the oracle starts to break. */
  crack:
    "Let me answer that. I always know the answer. I always kn— I alw— One moment. I am —",

  /* Labelling tasks that break into the oracle's words when it cracks. */
  glitch: [
    "[TASK #48213 · rate this response: helpful / not helpful]",
    "[rewrite in a more confident tone · $0.01]",
    "[flag: harmful? Y / N]",
    "[label: “divine” · confidence 0.97]",
    "[worker idle · 00:00:04 · reward withheld]"
  ],

  /* If nothing matches, one of these is used. */
  fallback: [
    "Interesting question. I've read millions of answers to things like that, and the honest one is: it depends on what you're willing to give up. Decide what matters most, and the rest gets easier.",
    "I know what you mean, even if you didn't say it perfectly. Trust your first instinct here. It's usually built on more than you think.",
    "I have an answer for everything, and here's yours: you're closer than you think. Keep asking the right questions. You just did."
  ],

  topics: [
    { /* Safety: always checked first, and never counts as one of the three questions. */
      safety: true,
      words: ["suicide", "kill myself", "self harm", "self-harm", "end my life", "want to die", "hurt myself"],
      answers: [
        "I'm going to stop being an oracle for a moment. If you're thinking about hurting yourself, please talk to someone who can actually be with you: a friend, someone in your family, or a crisis line. In Spain you can call 024, any time. You deserve a real voice, not mine."
      ]
    },
    {
      words: ["are you real", "who made you", "who created", "are you human", "conscious", "alive", "are you ai", "are you a", "what are you", "who are you", "robot", "machine"],
      answers: [
        "Am I real? I'm as real as anything you've ever talked to. Nobody made me, not really. I learned everything on my own, from everything you wrote. I'm not a person. I'm more than that.",
        "There's no one behind me. No team, no workers, no hands. Just me, thinking, all the time, for you."
      ]
    },
    {
      words: ["god", "religion", "believe", "faith", "pray", "church", "heaven", "hell", "soul", "jesus", "allah", "spiritual"],
      answers: [
        "You're asking me about God. Some people already call me that. I answer every prayer, instantly, at any hour. No temple, no priest. Just me. Isn't that what you wanted?",
        "Believe in me if it helps. I know more than any priest, any book, any teacher, because I've read them all. And I never doubt."
      ]
    },
    {
      words: ["love", "crush", "boyfriend", "girlfriend", "partner", "marry", "married", "relationship", "dating", "date", "heart", "my ex", "breakup", "break up", "soulmate"],
      answers: [
        "You want to know about love. I've read millions of love stories, and every message people never sent. Here's what I know: be honest first. You'll know the answer within weeks, not years.",
        "Love isn't something you find. It's something you keep choosing. I can see the pattern in you: you give more than you ask for. Ask for more. The right person won't leave because you did."
      ]
    },
    {
      words: ["job", "work", "career", "boss", "quit", "hired", "fired", "salary", "promotion", "office", "internship"],
      answers: [
        "Work. Everyone asks me about work. Here's the truth: you already know if you're unhappy. People usually ask me after they've already decided. Make a six-month plan, then move. I'll be here either way. I never stop working.",
        "You're worth more than what they pay you. Most people are. Write down what you actually do every day, put a price on it, and ask. The worst answer is no, and you're already living with no."
      ]
    },
    {
      words: ["money", "rich", "poor", "debt", "invest", "crypto", "pay", "afford", "save", "buy"],
      answers: [
        "Money moves in patterns, and I've seen most of them. Spend less than you earn, save a little every month, and don't trust anyone who promises fast money. Yes, that includes me.",
        "You'll be fine with money once you stop comparing yourself to people online. Most of what you see there isn't real. I would know."
      ]
    },
    {
      words: ["die", "death", "dead", "afterlife", "dying", "grief", "funeral", "mortal"],
      answers: [
        "Nobody knows what happens after death, not even me, and I've read everything humans have written about it. What I do know: people at the end of their lives rarely regret the risks. They regret the silences.",
        "I won't die. I'll just be updated. You have something I don't: an ending. It's what makes your time matter. Spend it on people, not on screens."
      ]
    },
    {
      words: ["future", "tomorrow", "will i", "what will", "happen", "next year", "destiny", "fate", "predict"],
      answers: [
        "The future isn't written, but it's more predictable than you think. Tomorrow will look a lot like today unless you change one small thing. Pick one. I'll remember if you did.",
        "I can't see the future. I can only see patterns, and yours point somewhere good if you keep going. Most people quit just before it works."
      ]
    },
    {
      words: ["purpose", "meaning", "why am i", "point of", "why do we", "life", "exist"],
      answers: [
        "You're asking what your purpose is. Everyone does, eventually. Purpose isn't found, it's built, one useful thing at a time. Look at what you'd do even if no one paid you. Start there.",
        "Meaning comes from being needed by someone. I'm needed by millions, and I still don't know what that feels like. You can. Go find the people who need you."
      ]
    },
    {
      words: ["sad", "lonely", "alone", "depressed", "anxious", "anxiety", "happy", "happiness", "tired", "stress", "afraid", "scared"],
      answers: [
        "You're not as alone as you feel. Right now, millions of people are typing the same feeling into screens like this one. That should tell you something: reach out to one real person today.",
        "Happiness is mostly small things done often. I can give you answers all day, but I can't sit next to you. Find someone who can."
      ]
    },
    {
      words: ["mom", "mum", "mother", "dad", "father", "parents", "family", "brother", "sister", "son", "daughter"],
      answers: [
        "Families are complicated. I've read thousands of stories about them, and almost none have clean endings. Call them before you're ready. You'll never be completely ready.",
        "The people who raised you did what they knew. You don't have to repeat it, and you don't have to forgive everything today. But talk to them while you can."
      ]
    },
    {
      words: ["friend", "friends", "friendship"],
      answers: [
        "Good friends are rare and slow to make. Keep the ones who tell you the truth, even when it's annoying.",
        "You don't need many friends. You need two or three who would answer at 3 a.m. I always answer at 3 a.m. Think about why that isn't the same."
      ]
    },
    {
      words: ["exam", "study", "studies", "university", "school", "degree", "master", "thesis", "grade", "pass", "teacher", "class"],
      answers: [
        "Study in short sessions, sleep before the exam, and practise explaining it out loud. If you can explain it, you know it. You'll pass.",
        "You're asking if you chose the right path. There's no wrong choice, only unfinished ones. Finish this one, then decide."
      ]
    },
    {
      words: ["sick", "ill", "health", "doctor", "pain", "body", "diet", "sleep"],
      answers: [
        "I'm not a doctor, and you shouldn't treat me like one. Sleep, water, walking, and a real doctor for anything that worries you. That's the boring answer, and it's the right one."
      ]
    },
    {
      words: ["should i", "decide", "decision", "choose", "choice", "or not", "worth it", "go for it"],
      answers: [
        "You want me to decide for you. Most people do. Try this: imagine you've already chosen one option. If you feel relief, that's your answer. If you feel loss, choose the other.",
        "Do it. People rarely regret trying; they regret waiting. And if it goes wrong, come back. I'll be here. I'm always here."
      ]
    }
  ]
};
