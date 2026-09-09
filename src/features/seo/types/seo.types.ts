import type { ActivityDetail } from "@/features/activities/types/activity.types";
import type { CourseDetail, CourseListItem } from "@/features/courses/types/course.types";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface PageMetadataInput {
  description: string;
  follow?: boolean;
  image?: string | null;
  index?: boolean;
  path: string;
  title: string;
}

export type JsonLdObject = Record<string, unknown>;

export interface JsonLdProps {
  data: JsonLdObject | JsonLdObject[];
}

export interface ActivityStructuredDataInput {
  activity: ActivityDetail;
  image: string | null;
  pageUrl: string;
}

export interface CourseStructuredDataInput {
  course: CourseDetail;
  image: string | null;
  pageUrl: string;
}

export interface CourseListStructuredDataInput {
  courses: CourseListItem[];
  siteUrl: string;
}

export interface SitemapActivityEntry {
  banner_path: string | null;
  slug: string;
  type: "event" | "training";
  updated_at: string;
}

export interface SitemapCourseEntry {
  banner_path: string | null;
  slug: string;
  updated_at: string;
}

export interface SitemapEntries {
  activities: SitemapActivityEntry[];
  courses: SitemapCourseEntry[];
}
