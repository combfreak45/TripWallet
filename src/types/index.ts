export interface Trip {
  id: number;
  name: string;
  startLocation: string;
  endLocation: string;
  startDate: string; // ISO date string
  endDate: string;
  createdAt: string;
}

export interface TripDocument {
  id: number;
  tripId: number;
  name: string;
  localPath: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface TravelCard {
  id: number;
  label: string;
  imagePath: string; // local URI of the saved photo/scan or document
  fileType: 'image' | 'document';
  createdAt: string; // ISO
}
