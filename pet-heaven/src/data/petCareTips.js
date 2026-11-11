// Detailed pet care topics shown on the Pet Care page.
export const careTopics = [
  {
    id: 'feeding', icon: '🍖', title: 'Feeding and Nutrition',
    summary: 'A balanced diet is the foundation of good health.',
    tips: ['Feed age-appropriate food at regular times', 'Always provide fresh, clean water', 'Never feed chocolate, grapes, raisins, onions or garlic', 'Keep treats to about 10% of daily calories'],
    details: [
      'Puppies and kittens need food made for growing bodies, while adults need a balanced maintenance diet and seniors may need lower-calorie options. Check the feeding guide on the pack and adjust portions to keep your pet at a healthy weight.',
      'Change foods gradually over 7 to 10 days by mixing a little more of the new food each day. A sudden change can upset your pet\'s stomach. Cats are obligate carnivores, so choose food that is complete and balanced for cats.',
    ],
  },
  {
    id: 'grooming', icon: '🛁', title: 'Grooming',
    summary: 'Keep coats, nails and ears clean and healthy.',
    tips: ['Brush long coats several times a week', 'Trim nails every 3 to 4 weeks', 'Bathe dogs monthly or when needed using pet shampoo', 'Check ears for redness or odour'],
    details: [
      'Regular brushing removes loose fur, spreads natural oils and lets you notice lumps, ticks or skin problems early. Short-haired pets need less brushing, but most cats and dogs enjoy the bonding time.',
      'Singapore\'s humid weather can cause skin infections, so dry your pet thoroughly after baths and walks in the rain. Use only products made for pets, as human shampoo can irritate their skin.',
    ],
  },
  {
    id: 'exercise', icon: '🏃', title: 'Exercise and Play',
    summary: 'Physical activity keeps body and mind sharp.',
    tips: ['Most dogs need 30 to 60 minutes of exercise a day', 'Cats enjoy short, interactive play sessions', 'Rotate toys to prevent boredom', 'Walk dogs in the early morning or evening to avoid heat'],
    details: [
      'The right amount of exercise depends on breed, age and health. Active breeds such as retrievers need more than small or senior dogs. Mental exercise like puzzle feeders and scent games is just as tiring as a walk.',
      'Pavements can become hot enough to burn paws at midday. Test the ground with the back of your hand and bring water on every walk. Indoor cats benefit from climbing shelves, tunnels and wand toys.',
    ],
  },
  {
    id: 'vaccination', icon: '💉', title: 'Vaccination and Health',
    summary: 'Stay on schedule to prevent serious disease.',
    tips: ['Complete the core vaccines for your pet', 'Give booster shots as advised by your vet', 'Use monthly flea, tick and heartworm prevention', 'Keep a health record in a safe place'],
    details: [
      'Vaccines protect pets from serious illnesses. Puppies and kittens usually start vaccinations at about 6 to 8 weeks and receive several doses before they are fully protected. Your vet will recommend a schedule that suits your pet.',
      'Annual check-ups help catch problems early. Mention changes in appetite, drinking, toilet habits or energy, even if they seem small.',
    ],
  },
  {
    id: 'dental', icon: '🦷', title: 'Dental Care',
    summary: 'Healthy teeth support a healthy body.',
    tips: ['Brush teeth with pet toothpaste, several times a week if possible', 'Offer vet-approved dental chews', 'Watch for bad breath, drooling or red gums', 'Book regular dental check-ups'],
    details: [
      'Dental disease is one of the most common health problems in pets. Plaque hardens into tartar, which can cause painful gums, tooth loss and infections that spread to other organs.',
      'Start slowly: let your pet taste the toothpaste, then introduce a soft brush or finger brush. Never use human toothpaste because it can be harmful if swallowed.',
    ],
  },
  {
    id: 'safe-home', icon: '🏠', title: 'Creating a Safe Home',
    summary: 'Prepare your home before your new friend arrives.',
    tips: ['Install safety netting on windows and balconies, especially for cats', 'Keep medicines, cleaning products and small objects out of reach', 'Provide a quiet, comfortable bed or hiding place', 'Check that plants are pet-safe'],
    details: [
      'High-rise living is common in Singapore, and cats can fall from unprotected windows and balconies. Netting and grilles are an essential safety measure.',
      'Give a new pet time to settle. Set up a quiet room with food, water, a bed and a litter box, then let them explore the rest of the home gradually over several days.',
    ],
  },
];

// Add a video URL to open a specific video; topics without one open a YouTube search.
export const videoTopics = [
  {
    id: 'dog-first-week',
    category: 'Dog Care',
    title: 'First Week After Adopting a Dog',
    url: 'https://www.youtube.com/watch?v=LHHXfkk4qV4&t=1s&pp=ygUfRmlyc3QgV2VlayBBZnRlciBBZG9wdGluZyBhIERvZw%3D%3D',
    query: 'First Week After Adopting a Dog',
    description: 'Help your newly adopted dog settle in during the first week.',
  },
  {
    id: 'dog-body-language',
    category: 'Dog Care',
    title: 'Understanding Dog Body Language',
     url: 'https://www.youtube.com/watch?v=vqP453qscMg&pp=ygUfVW5kZXJzdGFuZGluZyBEb2cgQm9keSBMYW5ndWFnZQ%3D%3D',
    query: 'Understanding Dog Body Language',
    description: 'Learn how dogs communicate through posture, expressions and movement.',
  },
  {
    id: 'dog-home-prep',
    category: 'Dog Care',
    title: 'Preparing Your Home for a New Dog',
    url: 'https://www.youtube.com/watch?v=lvbYw1s--EI&pp=ygUhUHJlcGFyaW5nIFlvdXIgSG9tZSBmb3IgYSBOZXcgRG9n',
    query: 'Preparing Your Home for a New Dog',
    description: 'Get your home ready to welcome a new dog safely and comfortably.',
  },
  {
    id: 'dog-emergencies',
    category: 'Dog Care',
    title: 'Common Dog Emergencies',
    url: 'https://youtu.be/XEoxQABxZtQ ',
    query: 'Common Dog Emergencies',
    description: 'Recognize common dog emergencies and know when to seek veterinary care.',
  },
  {
    id: 'cat-first-week',
    category: 'Cat Care',
    title: 'First Week After Adopting a Cat',
    url: 'https://www.youtube.com/watch?v=a8qNcy-48jU&pp=ygUfRmlyc3QgV2VlayBBZnRlciBBZG9wdGluZyBhIENhdA%3D%3D ', 
    query: 'First Week After Adopting a Cat',
    description: 'Help your newly adopted cat feel safe and settle in during the first week.',
  },
  {
    id: 'cat-body-language',
    category: 'Cat Care',
    title: 'Understanding Cat Body Language',
    url:'https://www.youtube.com/watch?v=OdxjQsYRQwk&pp=ygUfVW5kZXJzdGFuZGluZyBDYXQgQm9keSBMYW5ndWFnZdIHCQlHDAGHKiGM7w%3D%3D',
    query: 'Understanding Cat Body Language',
    description: 'Learn how cats communicate through their ears, tails and posture.',
  },
  {
    id: 'cat-home-prep',
    category: 'Cat Care',
    title: 'Preparing Your Home for a New Cat',
    url: 'https://youtu.be/ukxcwSZYUGY',
    query: 'Preparing Your Home for a New Cat',
    description: 'Prepare a safe, comfortable space before bringing your new cat home.',
  },
  {
    id: 'cat-emergencies',
    category: 'Cat Care',
    title: 'Common Cat Emergencies',
    url: 'https://www.youtube.com/watch?v=6SFW1B2QVOQ&pp=ygUWQ29tbW9uIENhdCBFbWVyZ2VuY2llcw%3D%3D',
    query: 'Common Cat Emergencies',
    description: 'Recognize common cat emergencies and know when to seek veterinary care.',
  },
];
