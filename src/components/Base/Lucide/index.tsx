import * as lucideIcons from "lucide-react";
import { twMerge } from "tailwind-merge";

interface LucideProps extends React.ComponentPropsWithoutRef<"svg"> {
  icon: keyof typeof lucideIcons;
  title?: string;
}

function Lucide({ icon, className, ...props }: LucideProps) {
  const IconComponent = lucideIcons[icon] as React.ElementType;

  if (!IconComponent) return null; // prevent error if icon is not found

  return (
    <IconComponent
      {...props}
      className={twMerge("stroke-1.5 w-5 h-5", className)}
    />
  );
}

export default Lucide;
