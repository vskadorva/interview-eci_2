import { Link } from "@tanstack/react-router";

interface SignInPromptProps {
  title: string;
}

export function SignInPrompt({ title }: SignInPromptProps) {
  return (
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <Link
        to="/login"
        className="text-indigo-600 hover:text-indigo-700 font-medium"
      >
        Go to sign in
      </Link>
    </div>
  );
}
