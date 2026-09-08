export type BusinessData = {
  businessName: string;
  category?: string;
  location?: string;
  services?: string[];
};

export type TemplateOption = {
  id: string;
  type: 'short' | 'detailed' | 'seo';
  text: string;
};

const CATEGORY_TEMPLATES: Record<string, { short: string[], detailed: string[], seo: string[] }> = {
  restaurant: {
    short: [
      "Great food and amazing service at {businessName}! Highly recommend.",
      "Had a wonderful meal at {businessName}. Everything was delicious.",
      "Fantastic experience at {businessName}. Will definitely be coming back!"
    ],
    detailed: [
      "I had an absolutely wonderful experience at {businessName}. The food quality was outstanding, and the staff was incredibly attentive and friendly. The ambience made the whole meal even better. I highly recommend visiting if you're in {location}.",
      "Just had dinner at {businessName} and it exceeded all expectations. From the moment we walked in, the service was impeccable. Every dish was full of flavor and beautifully presented. Truly a gem in {location}!"
    ],
    seo: [
      "If you are looking for a great restaurant in {location}, {businessName} is the place to go. The food is fantastic, and the staff is very welcoming. Everything was smooth from start to finish. Would definitely recommend them!",
      "Had a really good experience at {businessName} in {location}. The service was handled professionally and the atmosphere was perfect. Great spot for anyone looking for quality dining in the area."
    ]
  },
  dental: {
    short: [
      "Excellent dental care at {businessName}. The staff is very friendly and professional.",
      "Had a great experience at {businessName}. Clean, comfortable, and painless!",
      "Highly recommend {businessName} for anyone looking for a good dentist."
    ],
    detailed: [
      "I visited {businessName} recently and was very impressed with their professionalism and care. The clinic is spotless, and the team makes sure you feel comfortable throughout the entire treatment. The dentist was thorough and answered all my questions.",
      "Finding a good dentist can be tough, but {businessName} made everything so easy. From the front desk to the dental chair, the entire staff was welcoming and professional. Highly recommend them if you are in {location}!"
    ],
    seo: [
      "If you need a reliable dental clinic in {location}, I highly recommend {businessName}. The team is highly professional and the clinic is exceptionally clean. Great overall experience and smooth process.",
      "Had a really good experience at {businessName} in {location}. The dental treatment was handled professionally and the staff was very helpful. Everything was smooth from start to finish. Would definitely recommend them if you're looking for dental care in {location}."
    ]
  },
  salon: {
    short: [
      "Love my hair! The team at {businessName} always does an amazing job.",
      "Great salon experience at {businessName}. The staff is so talented and friendly.",
      "Always a relaxing experience at {businessName}. Highly recommend!"
    ],
    detailed: [
      "I absolutely love the service at {businessName}. The staff is incredibly skilled, professional, and they really listen to what you want. The ambiance of the salon is so relaxing. I left feeling completely refreshed!",
      "I had the best experience at {businessName} today. The team is so welcoming and they pay great attention to detail. I am thrilled with the results and will definitely be returning. Highly recommend their services in {location}!"
    ],
    seo: [
      "Looking for a great salon in {location}? {businessName} is fantastic. The service quality is top-notch, and the staff is very professional. Everything was smooth from start to finish. Would definitely recommend them!",
      "Had a really good experience at {businessName} in {location}. The styling was handled professionally and the staff was very helpful. Would definitely recommend them if you're looking for salon services in {location}."
    ]
  },
  hotel: {
    short: [
      "Wonderful stay at {businessName}. Clean rooms and great hospitality.",
      "Really enjoyed our time at {businessName}. The staff was very welcoming.",
      "Great hotel! {businessName} had everything we needed for a comfortable stay."
    ],
    detailed: [
      "We had an incredible stay at {businessName}. The room was perfectly clean and very comfortable. What really stood out was the exceptional hospitality from the staff—they went out of their way to make us feel welcome. Will definitely stay here again!",
      "Our experience at {businessName} was top-notch. The amenities were great, the location was convenient, and the staff was incredibly accommodating. It made our trip to {location} so much better. Highly recommend!"
    ],
    seo: [
      "If you're looking for a great place to stay in {location}, I highly recommend {businessName}. The rooms are clean, the hospitality is excellent, and the overall experience was fantastic. Would definitely book again!",
      "Had a really good stay at {businessName} in {location}. The accommodation was handled professionally and the staff was very helpful. Everything was smooth from check-in to check-out. Would definitely recommend them if you're visiting {location}."
    ]
  },
  realestate: {
    short: [
      "Great experience working with {businessName}. Very professional and helpful.",
      "{businessName} made the process so easy and stress-free. Highly recommend!",
      "Fantastic service from {businessName}. They really know the market."
    ],
    detailed: [
      "Working with {businessName} was an absolute pleasure. They were incredibly professional, communicative, and truly had our best interests at heart. They guided us through every step of the process and answered all our questions. Highly recommend!",
      "I cannot say enough good things about {businessName}. Their expertise and dedication made a stressful process feel incredibly smooth and easy. They are very knowledgeable about the market in {location}. Fantastic experience overall!"
    ],
    seo: [
      "If you need reliable real estate services in {location}, I highly recommend {businessName}. Their team is highly professional and the communication is excellent. Great overall experience and smooth process.",
      "Had a really good experience with {businessName} in {location}. The process was handled professionally and the team was very helpful. Everything was smooth from start to finish. Would definitely recommend them for real estate needs in {location}."
    ]
  },
  gym: {
    short: [
      "Awesome gym! {businessName} has great equipment and a supportive environment.",
      "Love working out at {businessName}. Clean facility and friendly staff.",
      "Highly recommend {businessName} for anyone looking for a great fitness center."
    ],
    detailed: [
      "I've been going to {businessName} and it's been a fantastic experience. The facility is always clean, the equipment is top-notch, and the environment is very motivating. The trainers and staff are incredibly friendly and supportive. Highly recommend!",
      "If you are looking for a great place to work out, {businessName} is it. They have everything you need, whether you are a beginner or experienced. The community vibe is great and the staff really cares about your progress."
    ],
    seo: [
      "If you are looking for a great gym in {location}, {businessName} is the place to go. The facility is clean, the equipment is excellent, and the staff is very welcoming. Everything is well-maintained. Would definitely recommend!",
      "Had a really good experience at {businessName} in {location}. The fitness center is run professionally and the staff is very helpful. Everything was smooth from sign-up to daily workouts. Would definitely recommend them if you're looking for a gym in {location}."
    ]
  },
  doctor: {
    short: [
      "Excellent medical care at {businessName}. The staff is very caring and professional.",
      "Had a great experience at {businessName}. The doctor really listens.",
      "Highly recommend {businessName} for anyone looking for a good doctor."
    ],
    detailed: [
      "I visited {businessName} recently and felt completely well cared for. The clinic is spotless, and the team makes sure you feel comfortable throughout. The doctor was thorough, listened to all my concerns, and explained everything clearly.",
      "Finding a good doctor can be difficult, but {businessName} made everything so reassuring. From the front desk to the consultation, the entire staff was welcoming and professional. Highly recommend them if you are in {location}!"
    ],
    seo: [
      "If you need a reliable medical clinic or doctor in {location}, I highly recommend {businessName}. The team is highly professional and the clinic is very well run. Great overall experience and smooth process.",
      "Had a really good experience at {businessName} in {location}. The medical consultation was handled professionally and the staff was very helpful. Would definitely recommend them if you're looking for healthcare in {location}."
    ]
  },
  retail: {
    short: [
      "Great selection and amazing service at {businessName}! Highly recommend.",
      "Always find exactly what I need at {businessName}. Great store.",
      "Fantastic shopping experience at {businessName}. Will be coming back!"
    ],
    detailed: [
      "I had an absolutely wonderful experience at {businessName}. The quality of their products is outstanding, and the staff was incredibly helpful without being pushy. I highly recommend visiting if you're in {location}.",
      "Just shopped at {businessName} and it was great. From the moment we walked in, the service was excellent. They have a fantastic selection and great prices. Truly a gem in {location}!"
    ],
    seo: [
      "If you are looking for a great store in {location}, {businessName} is the place to go. The products are fantastic, and the staff is very welcoming. Everything was easy to find. Would definitely recommend them!",
      "Had a really good experience shopping at {businessName} in {location}. The service was handled professionally and the store was very well organized. Great spot for anyone looking for quality items in the area."
    ]
  },
  local_service: {
    short: [
      "Excellent service from {businessName}. Punctual, professional, and reliable.",
      "Had a great experience with {businessName}. They did exactly what they promised.",
      "Highly recommend {businessName} for anyone looking for good reliable service."
    ],
    detailed: [
      "I used {businessName} recently and was very impressed with their professionalism and quality of work. They were on time, explained everything clearly, and got the job done right the first time. Very happy with the results!",
      "Finding a good local service can be tough, but {businessName} made everything so easy. From the initial quote to the finished job, the entire team was professional and courteous. Highly recommend them if you are in {location}!"
    ],
    seo: [
      "If you need a reliable service provider in {location}, I highly recommend {businessName}. The team is highly professional and the quality of work is exceptional. Great overall experience and smooth process.",
      "Had a really good experience with {businessName} in {location}. The job was handled professionally and the staff was very helpful. Everything was smooth from start to finish. Would definitely recommend them if you're looking for service in {location}."
    ]
  },
  education: {
    short: [
      "Excellent learning experience at {businessName}. Very knowledgeable instructors.",
      "Had a great time learning at {businessName}. Highly recommended!",
      "Highly recommend {businessName} for anyone looking to improve their skills."
    ],
    detailed: [
      "I attended classes at {businessName} and was very impressed with their professionalism and curriculum. The instructors are extremely knowledgeable and make sure you feel comfortable throughout the entire learning process. Great environment!",
      "Finding a good educational program can be tough, but {businessName} exceeded expectations. From the support staff to the teachers, everyone was welcoming and professional. Highly recommend them if you are in {location}!"
    ],
    seo: [
      "If you need a reliable coaching or education center in {location}, I highly recommend {businessName}. The team is highly professional and the classes are very well structured. Great overall learning experience.",
      "Had a really good experience with {businessName} in {location}. The instruction was handled professionally and the staff was very helpful. Would definitely recommend them if you're looking for classes in {location}."
    ]
  },
  default: {
    short: [
      "Great experience at {businessName}! Highly recommend.",
      "Had a wonderful time at {businessName}. Everything was excellent.",
      "Fantastic service at {businessName}. Will definitely be coming back!"
    ],
    detailed: [
      "I had an absolutely wonderful experience at {businessName}. The quality of service was outstanding, and the staff was incredibly attentive and friendly. The whole experience exceeded my expectations. I highly recommend visiting if you're in {location}.",
      "Just visited {businessName} and it was fantastic. From the moment I arrived, the service was impeccable. Everything was handled with great care and professionalism. Truly a great business in {location}!"
    ],
    seo: [
      "If you are looking for great service in {location}, {businessName} is the place to go. The quality is fantastic, and the team is very professional. Everything was smooth from start to finish. Would definitely recommend them!",
      "Had a really good experience at {businessName} in {location}. The service was handled professionally and the staff was very helpful. Everything was easy and straightforward. Would definitely recommend them if you're looking for this service in {location}."
    ]
  }
};

function normalizeCategory(category: string): string {
  const lower = category.toLowerCase();
  if (lower.includes('restaurant') || lower.includes('food') || lower.includes('cafe') || lower.includes('dining')) return 'restaurant';
  if (lower.includes('dentist') || lower.includes('dental')) return 'dental';
  if (lower.includes('salon') || lower.includes('hair') || lower.includes('spa') || lower.includes('beauty')) return 'salon';
  if (lower.includes('hotel') || lower.includes('motel') || lower.includes('resort') || lower.includes('stay')) return 'hotel';
  if (lower.includes('real estate') || lower.includes('realtor') || lower.includes('property')) return 'realestate';
  if (lower.includes('gym') || lower.includes('fitness') || lower.includes('workout')) return 'gym';
  if (lower.includes('doctor') || lower.includes('clinic') || lower.includes('hospital') || lower.includes('medical') || lower.includes('health')) return 'doctor';
  if (lower.includes('retail') || lower.includes('store') || lower.includes('shop') || lower.includes('boutique')) return 'retail';
  if (lower.includes('service') || lower.includes('plumber') || lower.includes('electrician') || lower.includes('cleaning') || lower.includes('repair') || lower.includes('contractor')) return 'local_service';
  if (lower.includes('education') || lower.includes('coaching') || lower.includes('tutor') || lower.includes('school') || lower.includes('class')) return 'education';
  return 'default';
}

function getRandomTemplate(templates: string[], avoidIndex: number = -1): string {
  if (templates.length === 0) return "";
  let idx;
  do {
    idx = Math.floor(Math.random() * templates.length);
  } while (idx === avoidIndex && templates.length > 1);
  return templates[idx];
}

export function getBaseTemplates(
  business: BusinessData
): TemplateOption[] {
  const catKey = business.category ? normalizeCategory(business.category) : 'default';
  const templates = CATEGORY_TEMPLATES[catKey] || CATEGORY_TEMPLATES['default'];
  
  const location = business.location && business.location.trim() !== '' ? business.location.split(',')[0].trim() : 'the area';
  const businessName = business.businessName && business.businessName.trim() !== '' ? business.businessName : 'this business';

  const replacePlaceholders = (text: string) => {
    return text
      .replace(/{businessName}/g, businessName)
      .replace(/{location}/g, location);
  };

  return [
    {
      id: 'short',
      type: 'short',
      text: replacePlaceholders(getRandomTemplate(templates.short))
    },
    {
      id: 'detailed',
      type: 'detailed',
      text: replacePlaceholders(getRandomTemplate(templates.detailed))
    },
    {
      id: 'seo',
      type: 'seo',
      text: replacePlaceholders(getRandomTemplate(templates.seo))
    }
  ];
}

export function applyContextToTemplate(
  baseText: string,
  userContext: string[] = [],
  customNote: string = ''
): string {
  if (userContext.length === 0 && !customNote.trim()) return baseText;
  
  let contextStr = "";
  if (userContext.length > 0) {
    contextStr = `Loved the ${userContext.map(c => c.toLowerCase()).join(', ')}. `;
  }
  if (customNote.trim()) {
    contextStr += `${customNote.trim()} `;
  }
  
  contextStr = contextStr.charAt(0).toUpperCase() + contextStr.slice(1);
  
  return `${contextStr}${baseText}`;
}
