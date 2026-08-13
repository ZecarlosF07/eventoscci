import { MyCoursesTemplate } from "@/components/templates/MyCoursesTemplate";
import { getMyCourses } from "@/features/courses/queries/get-my-courses";
export default async function MyCoursesPage() { return <MyCoursesTemplate courses={await getMyCourses()} />; }
