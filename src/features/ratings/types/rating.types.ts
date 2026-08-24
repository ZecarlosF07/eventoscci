export interface CourseRating {
  comment: string | null;
  courseId: string;
  createdAt: string;
  enrollmentId: string;
  id: string;
  rating: number;
  updatedAt: string;
}

export interface CourseRatingFormState {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
}

export interface CourseRatingFormProps {
  courseId: string;
  rating: CourseRating | null;
}
