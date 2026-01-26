// Added React import to provide the React namespace for ReactNode usage
import React from 'react';

export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

export interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
