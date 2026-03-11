import { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, BookOpen, MessageSquare, ListChecks, Send, Loader2, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface VivaResult {
  examPoints: string[];
  shortAnswer: string;
  vivaExplanation: string;
}

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group relative"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-400" />
      ) : (
        <Copy className="w-4 h-4 text-white/60 group-hover:text-white" />
      )}
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-emerald-500 text-white text-[10px] rounded font-bold uppercase tracking-tighter">
          Copied!
        </span>
      )}
    </button>
  );
};

export default function App() {

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VivaResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Updated Gemini API function
  const generateVivaNotes = async () => {

    if (!input.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {

      const prompt = `
Convert the following text into:

1. Five clear exam bullet points
2. A short 2-line exam answer
3. A simple explanation for viva speaking

Text: ${input}

Return the response strictly in JSON format:

{
 "examPoints": ["point1","point2","point3","point4","point5"],
 "shortAnswer": "two line answer",
 "vivaExplanation": "simple explanation"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const text = response.text;

      if (!text) throw new Error("Empty response from Gemini");

      const parsed: VivaResult = JSON.parse(text);

      setResult(parsed);

    } catch (err) {

      console.error("Gemini Error:", err);
      setError("AI failed to generate response. Please try again.");

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen font-sans p-4 md:p-8 flex flex-col items-center">
      {/* Version Badge */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-4 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] uppercase tracking-widest text-white/60 font-medium"
      >
        v4.1.0 • Gemini 1.5 Flash
      </motion.div>

      {/* Header */}
      <header className="text-center mb-12 mt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-3 mb-2"
        >
          <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            VivaPrep AI
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-white/80 text-lg md:text-xl font-light"
        >
          Turn Any Answer Into Viva Ready Notes
        </motion.p>
      </header>

      {/* Main Section */}
      <main className="w-full max-w-4xl space-y-8">

        {/* Example Questions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 text-white/60 text-sm font-medium px-2">
            <BookOpen className="w-4 h-4" />
            <span>Example Questions</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              "Explain BFS Algorithm",
              "Explain Machine Learning",
              "Explain OSI Model",
              "Explain DBMS"
            ].map((topic) => (
              <button
                key={topic}
                onClick={() => setInput(topic)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-sm transition-all active:scale-95 backdrop-blur-sm"
              >
                {topic}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-6 md:p-8 rounded-3xl"
        >
          <div className="relative">

            <textarea
              className="glass-input w-full h-48 md:h-64 rounded-2xl p-6 text-lg resize-none"
              placeholder="Paste your question or long answer here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <div className="absolute bottom-4 right-4">

              <button
                onClick={generateVivaNotes}
                disabled={loading || !input.trim()}
                className="glow-button flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >

                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}

                {loading ? "Generating..." : "Generate Answer"}

              </button>

            </div>
          </div>
        </motion.div>

        {/* Loader */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-12"
            >
              <div className="loader mb-4"></div>
              <p className="text-white/70 animate-pulse">
                AI is crafting your viva notes...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-2xl text-center">
            {error}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12"
            >

              {/* Exam Points */}
              <motion.div whileHover={{ y: -5 }} className="glass-card p-6 rounded-3xl relative">
                <div className="absolute top-4 right-4">
                  <CopyButton text={result.examPoints.join('\n')} />
                </div>

                <div className="flex items-center gap-2 mb-4 text-purple-200">
                  <ListChecks className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">Exam Points</h3>
                </div>

                <ul className="space-y-3 text-white/90 text-sm">

                  {result.examPoints.map((point, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-purple-400 font-bold">•</span>
                      {point}
                    </li>
                  ))}

                </ul>

              </motion.div>

              {/* Short Answer */}
              <motion.div whileHover={{ y: -5 }} className="glass-card p-6 rounded-3xl relative">
                <div className="absolute top-4 right-4">
                  <CopyButton text={result.shortAnswer} />
                </div>

                <div className="flex items-center gap-2 mb-4 text-blue-200">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">2 Line Exam Answer</h3>
                </div>

                <p className="text-white/90 text-sm italic">
                  "{result.shortAnswer}"
                </p>

              </motion.div>

              {/* Viva Explanation */}
              <motion.div whileHover={{ y: -5 }} className="glass-card p-6 rounded-3xl relative">
                <div className="absolute top-4 right-4">
                  <CopyButton text={result.vivaExplanation} />
                </div>

                <div className="flex items-center gap-2 mb-4 text-emerald-200">
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">Viva Explanation</h3>
                </div>

                <p className="text-white/90 text-sm">
                  {result.vivaExplanation}
                </p>

              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      <footer className="mt-auto py-8 text-white/50 text-sm">
        Powered by VivaPrep AI
      </footer>

    </div>
  );
}