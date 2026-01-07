import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import Logo from "./logo";

interface Props {
  title?: string;
  description?: string;
}

const EmptyState = ({
  title = "No chat selected",
  description = "Pick a chat or start a new one",
}: Props) => {
  return (
    <div>
      <Empty className="w-full h-screen flex-1 flex items-center justify-center bg-muted/20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Logo showText={false} />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
};

export default EmptyState;
