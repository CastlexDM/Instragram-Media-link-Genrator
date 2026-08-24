export type MediaType = "Post" | "Reel";

export type InstagramMedia = {
  id: string;
  type: MediaType;
  date: string;
  caption: string;
  url: string;
  preview?: string;
  permalink?: string;
};

export type InstagramProfile = {
  username: string;
  url: string;
};

export type InstagramLookupResult = {
  profile: InstagramProfile;
  media: InstagramMedia[];
  source: string;
};
