import LinkedInLink from './ui/LinkedInLink';
import GitHubLink from './ui/GitHubLink';

export default function Footer() {
  return (
    <footer className="border-purple-lightest mt-auto border-t bg-white px-8 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-end">
        <div className="flex items-center gap-4">
          <LinkedInLink href="https://www.linkedin.com/in/katerinewitkoski/" />
          <GitHubLink href="https://github.com/katerine-dev" />
        </div>
      </div>
    </footer>
  );
}
