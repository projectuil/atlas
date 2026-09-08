import { getPatterns } from "@/lib/api";
import PatternClient from "@/components/PatternClient";

export default function PatternsIndex() {
  const patterns = getPatterns();
  
  return <PatternClient initialPatterns={patterns} volumes={[]} />;
}
