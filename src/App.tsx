import { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, BookOpen, MessageSquare, ListChecks, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface VivaResult {
  examPoints: string[];
  shortAnswer: string;
  vivaExplanation: string;
}

// Main application component
export default function App() {
  // State for user input text
  const [input, setInput] = useState('');
  // State to track if AI is currently generating
  const [loading, setLoading] = useState(false);
  // State to store the AI-generated results
  const [result, setResult] = useState<VivaResult | null>(null);
  // State for handling and displaying errors
  const [error, setError] = useState<string | null>(null);

  // Function to call Gemini AI and get viva notes
  const generateVivaNotes = async () => {
    if (!input.trim()) return; // Don't run if input is empty

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Using the latest Gemini Flash model for fast responses
      const model = "gemini-flash-latest";
      
      // The prompt logic to guide the AI
      const prompt = `Convert the following text into:
      1. Five clear exam bullet points
      2. A short 2-line exam answer
      3. A simple explanation for viva speaking

      Text: ${input}

      Return the response in JSON format with keys: "examPoints" (array of strings), "shortAnswer" (string), and "vivaExplanation" (string).`;

      // Call the Gemini API
      const response = await genAI.models.generateContent({
        model: model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json", // Request JSON output
        }
      });

      // Extract and parse the JSON response
      const text = response.text;
      if (text) {
        const parsedResult = JSON.parse(text) as VivaResult;
        setResult(parsedResult);
      }
    } catch (err) {
      console.error("Error generating viva notes:", err);
      setError("Failed to generate notes. Please try again.");
    } finally {
      setLoading(false); // Stop loading animation
    }
  };

  return (
    <div className="min-h-screen font-sans p-4 md:p-8 flex flex-col items-center">
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
          "Turn Any Answer Into Viva Ready Notes"
        </motion.p>
      </header>

      {/* Main Section */}
      <main className="w-full max-w-4xl space-y-8">
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

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="loader mb-4"></div>
              <p className="text-white/70 animate-pulse">AI is crafting your viva notes...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-white p-4 rounded-2xl text-center">
            {error}
          </div>
        )}

        {/* Results Section */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12"
            >
              {/* Card 1: Exam Points */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="glass-card p-6 rounded-3xl flex flex-col h-full"
              >
                <div className="flex items-center gap-2 mb-4 text-purple-200">
                  <ListChecks className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">Exam Points</h3>
                </div>
                <ul className="space-y-3 text-white/90 text-sm flex-grow">
                  {result.examPoints.map((point, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-2"
                    >
                      <span className="text-purple-400 font-bold">•</span>
                      {point}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Card 2: 2 Line Answer */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="glass-card p-6 rounded-3xl flex flex-col h-full"
              >
                <div className="flex items-center gap-2 mb-4 text-blue-200">
                  <BookOpen className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">2 Line Exam Answer</h3>
                </div>
                <p className="text-white/90 text-sm leading-relaxed italic">
                  "{result.shortAnswer}"
                </p>
              </motion.div>

              {/* Card 3: Viva Explanation */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="glass-card p-6 rounded-3xl flex flex-col h-full"
              >
                <div className="flex items-center gap-2 mb-4 text-emerald-200">
                  <MessageSquare className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">Viva Explanation</h3>
                </div>
                <p className="text-white/90 text-sm leading-relaxed">
                  {result.vivaExplanation}
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 text-white/50 text-sm">
        <p>Powered by VivaPrep AI</p>
      </footer>
    </div>
  );
}
