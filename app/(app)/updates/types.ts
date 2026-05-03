export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  role?: string;
}

export interface Tag {
  id: string;
  label: string;
  color: string;
}

export interface Post {

  id: string;
  author: User;
  community?: {
    name: string;
    icon: string;
  };

  title: string;
  excerpt: string;
  content: string;
  thumbnail?: string;
  tags: Tag[];
  createdAt: string;
  likes: number;
  comments: number;
  readTime: string;
}
