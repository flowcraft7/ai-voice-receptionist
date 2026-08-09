declare module "next/navigation" {
  export function useParams(): { [key: string]: string | undefined };
  export function useRouter(): any;
}
