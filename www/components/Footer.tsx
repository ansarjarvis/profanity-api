import { Github, Twitter, Youtube, Instagram } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-blue-50">
      <div className="p-6 bg-white mx-auto relative z-10 overflow-hidden border border-b-0 border-gray-200">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link href="/">
            {/* <LogoType className="h-7 text-gray-800" /> */}
          </Link>
          <p className="max-w-md text-sm text-gray-500">
            This project turned out to be more enjoyable and successful than I
            initially anticipated :D
          </p>
          <p className="max-w-md text-sm text-gray-500">
            Hello Curious👋, I am{" "}
            <a
              className="underline"
              href="https://ansarjarvis.onrender.com/"
              target="_blank"
              rel="noreferrer"
            >
              Ansar
            </a>
            , the developer behind ProfanityAPI.
          </p>
          <p className="text-sm leading-5 text-gray-400">
            © {new Date().getFullYear()} ProfanityAPI🖤JARVIS
          </p>
          <div className="flex items-center space-x-3">
            <a
              href="https://github.com/ansarjarvis"
              target="_blank"
              rel="noreferrer"
              className="group rounded-full border border-gray-200 p-2 transition-colors hover:bg-gray-100"
            >
              <span className="sr-only">Github</span>
              <Github className="h-4 w-4 text-gray-600 transition-colors group-hover:text-black" />
            </a>
            <a
              href="https://www.instagram.com/ansar_jarvis/"
              target="_blank"
              rel="noreferrer"
              className="group rounded-full border border-gray-200 p-2 transition-colors hover:bg-gray-100"
            >
              <span className="sr-only">Instagram</span>
              <Instagram className="h-4 w-4 text-gray-600 transition-colors group-hover:text-black" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
