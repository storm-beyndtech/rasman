import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

export default function ArchivePlaceholder() {
  const { scrollY } = useScroll();

	return (
		<motion.div
			initial={{ opacity: 0, y: 50 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, delay: 0.3 }}
			style={{ y: useTransform(scrollY, [0, 1000], [0, -400]) }}
			className="w-[160px] h-[500px] mx-auto mb-[-500px]"
		>
			<Link href="/songs" className="block h-full relative">
				<Image src="/images/Archive.svg" alt="Archive" width={160} height={500} />
			</Link>
		</motion.div>
	);
}
