import Link from 'next/link';
import Image from 'next/image';
import logo from '../../public/images/logo.png';

export default function Logo({ href = "/", className = "" }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center justify-center mt-7  ${className}`}
    >
        <Image 
        src={logo} 
        alt="Medya Logo"
        priority
        className=""
      />
    </Link>
  );
} 