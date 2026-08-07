"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Trophy,
  Medal,
  Star,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Users,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { ref, get, set, onValue, update } from "firebase/database";
import { useAuth } from "@/context/AuthContext";
import DOMPurify from "dompurify";

export default function GeneralKnowledgeQuiz() {
  const { user, isAdmin } = useAuth();

  const [dbUser, setDbUser] = useState<any>(null);
  const [isHead, setIsHead] = useState(false);

  const [gameState, setGameState] = useState<
    "intro" | "loading" | "playing" | "result"
  >("intro");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [previousResult, setPreviousResult] = useState<any>(null);

  const [studentClass, setStudentClass] = useState("");

  useEffect(() => {
    if (!user) return;

    // Fetch user details and role
    const userRef = ref(db, `users/${user.uid}`);
    get(userRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.val();
        setDbUser(data);
        setIsHead(data.role === "head" || isAdmin);
      }
    });

    // Check if user has already played
    const scoreRef = ref(db, `quiz_scores/${user.uid}`);
    get(scoreRef).then((snap) => {
      if (snap.exists()) {
        setHasPlayed(true);
        setPreviousResult(snap.val());
        setGameState("result");
      }
    });

    // Listen to leaderboard
    const allScoresRef = ref(db, "quiz_scores");
    const unsubscribeScores = onValue(allScoresRef, (snap) => {
      if (snap.exists()) {
        const scores = Object.entries(snap.val()).map(([uid, val]: any) => ({
          uid,
          ...val,
        }));
        // Sort by score desc, then by time taken (if we had it, but we can just sort by score)
        scores.sort((a, b) => b.score - a.score);
        setLeaderboard(scores);
      }
    });

    return () => unsubscribeScores();
  }, [user, isAdmin]);

  const startQuiz = async () => {
    if (!studentClass) {
      alert("Please enter your Class before starting!");
      return;
    }

    setGameState("loading");
    try {
      // Open Trivia DB (10 easy-medium general questions)
      const res = await fetch(
        "https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple",
      );
      const data = await res.json();

      if (data.results) {
        // Format questions
        const formatted = data.results.map((q: any) => {
          const options = [...q.incorrect_answers, q.correct_answer];
          // Shuffle options
          options.sort(() => Math.random() - 0.5);
          return {
            question: q.question,
            correct: q.correct_answer,
            options: options,
          };
        });
        setQuestions(formatted);
        setGameState("playing");
      } else {
        alert("Failed to load questions. Server is down.");
        setGameState("intro");
      }
    } catch (err) {
      alert("Failed to connect. Please check your internet.");
      setGameState("intro");
    }
  };

  const handleAnswer = (option: string) => {
    setAnswers({ ...answers, [currentQIndex]: option });

    if (currentQIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQIndex(currentQIndex + 1);
      }, 500);
    } else {
      finishQuiz({ ...answers, [currentQIndex]: option });
    }
  };

  const finishQuiz = async (finalAnswers: Record<number, string>) => {
    let finalScore = 0;
    const reviewData = questions.map((q, idx) => {
      const isCorrect = finalAnswers[idx] === q.correct;
      if (isCorrect) finalScore += 10;
      return {
        question: q.question,
        userAnswer: finalAnswers[idx] || "Skipped",
        correctAnswer: q.correct,
        isCorrect,
      };
    });

    setScore(finalScore);

    const resultObj = {
      name: dbUser?.name || "Unknown Student",
      mobile: dbUser?.mobile || "",
      studentClass,
      score: finalScore,
      total: questions.length * 10,
      timestamp: Date.now(),
      review: reviewData,
    };

    setPreviousResult(resultObj);
    setHasPlayed(true);
    setGameState("result");

    // Save to Firebase
    if (user) {
      await set(ref(db, `quiz_scores/${user.uid}`), resultObj);
    }
  };

  const printCertificate = () => {
    window.print();
  };

  // UI Components
  const IntroView = () => (
    <div className="flex flex-col items-center justify-center p-6 glass-card rounded-3xl max-w-lg mx-auto w-full text-center">
      <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_-5px_rgba(236,72,153,0.5)]">
        <Trophy className="w-10 h-10 text-pink-400" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">
        Nimboda Quiz Challenge
      </h2>
      <p className="text-slate-300 mb-6">
        Test your knowledge, compete with others in your village, and win the
        top rank! 🏅
      </p>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 w-full text-left space-y-2">
        <h3 className="text-pink-400 font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> Rules (No Cheating)
        </h3>
        <ul className="text-sm text-slate-300 list-disc list-inside">
          <li>
            You can attempt this quiz <strong>ONLY ONCE</strong>.
          </li>
          <li>10 Questions. Each correct answer gives 10 points.</li>
          <li>Your rank will be shown on the Leaderboard.</li>
          <li>Your personal info (Mobile) is hidden from other students.</li>
        </ul>
      </div>

      <div className="w-full mb-6">
        <label className="block text-left text-sm font-medium text-slate-300 mb-2">
          Which class do you study in? (e.g. 10th, 12th, College)
        </label>
        <input
          type="text"
          value={studentClass}
          onChange={(e) => setStudentClass(e.target.value)}
          placeholder="Enter your class..."
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
      </div>

      <button
        onClick={startQuiz}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold text-lg hover:shadow-[0_0_20px_-5px_rgba(236,72,153,0.6)] transition-all hover:-translate-y-1"
      >
        Start Quiz Now!
      </button>
    </div>
  );

  const PlayingView = () => {
    const q = questions[currentQIndex];
    if (!q) return null;

    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-6 px-4">
          <span className="text-pink-400 font-bold bg-pink-500/10 px-4 py-1 rounded-full border border-pink-500/20">
            Question {currentQIndex + 1} / {questions.length}
          </span>
          <span className="text-purple-400 font-bold flex items-center gap-1">
            <Star className="w-4 h-4" /> Score: {currentQIndex * 10}
          </span>
        </div>

        <div className="w-full glass-card p-6 md:p-8 rounded-3xl mb-6 border-t-4 border-t-pink-500">
          <h2
            className="text-xl md:text-2xl font-bold text-white mb-8 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(q.question) }}
          />

          <div className="grid gap-4">
            {q.options.map((opt: string, idx: number) => {
              const isSelected = answers[currentQIndex] === opt;
              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                    isSelected
                      ? "bg-pink-500/20 border-pink-500 text-white scale-[1.02]"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-pink-500/50 hover:text-white"
                  }`}
                >
                  <span
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(opt),
                    }}
                  />
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-pink-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const ResultView = () => {
    if (!previousResult) return null;

    return (
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 print-friendly">
        {/* Left Side: Score & Certificate */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-8 rounded-3xl text-center border border-pink-500/30 bg-gradient-to-b from-pink-500/10 to-transparent">
            <h2 className="text-2xl font-bold text-white mb-2">
              Quiz Completed!
            </h2>
            <p className="text-slate-300 mb-8">
              You can only take this quiz once.
            </p>

            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-pink-500 to-purple-500 flex flex-col items-center justify-center text-white shadow-[0_0_40px_-5px_rgba(236,72,153,0.5)] border-4 border-black/50 mb-6">
              <span className="text-4xl font-black">
                {previousResult.score}
              </span>
              <span className="text-xs uppercase font-bold opacity-80">
                / {previousResult.total}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white">
              {previousResult.name}
            </h3>
            <p className="text-pink-400">
              Class: {previousResult.studentClass}
            </p>
          </div>

          {/* Certificate Section */}
          {previousResult.score === previousResult.total ? (
            <div className="glass-panel p-1 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600">
              <div className="bg-black/90 p-6 rounded-2xl text-center relative overflow-hidden h-full flex flex-col items-center justify-center">
                <Medal className="w-16 h-16 text-yellow-400 mx-auto mb-4 opacity-20 absolute top-4 right-4" />
                <h3 className="text-2xl font-serif font-bold text-yellow-500 mb-2">
                  Certificate of Excellence
                </h3>
                <p className="text-slate-300 text-sm mb-4">
                  Presented by Nimboda Education to
                </p>
                <h2 className="text-3xl font-bold text-white mb-4 italic">
                  {previousResult.name}
                </h2>
                <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6">
                  For achieving a perfect score of {previousResult.total}/
                  {previousResult.total} in the Universal Knowledge Quiz.
                </p>
                <button
                  onClick={printCertificate}
                  className="hide-on-print flex items-center justify-center gap-2 px-6 py-2 bg-yellow-500 text-black font-bold rounded-full hover:bg-yellow-400 transition-colors mx-auto"
                >
                  <Download className="w-4 h-4" /> Download Certificate
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-card p-6 rounded-3xl text-center border border-white/5">
              <p className="text-slate-400 text-sm mb-4">
                Score 100% to unlock your official Nimboda Certificate!
              </p>
              <div className="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                <Medal className="w-8 h-8 text-white/20" />
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Answer Sheet & Review */}
        <div className="glass-card rounded-3xl flex flex-col overflow-hidden max-h-[800px] border border-white/10 hide-on-print">
          <div className="bg-white/5 p-6 border-b border-white/10 flex items-center justify-between sticky top-0 backdrop-blur-xl z-10">
            <div>
              <h3 className="text-xl font-bold text-white">Answer Sheet</h3>
              <p className="text-xs text-slate-400">Review your mistakes</p>
            </div>
          </div>

          <div className="p-6 overflow-y-auto space-y-6">
            {previousResult.review?.map((r: any, idx: number) => (
              <div
                key={idx}
                className="bg-black/20 p-4 rounded-xl border border-white/5"
              >
                <p
                  className="text-white font-medium text-sm mb-3"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(`${idx + 1}. ${r.question}`),
                  }}
                />

                <div className="space-y-2">
                  <div
                    className={`flex items-start gap-2 p-3 rounded-lg text-sm ${r.isCorrect ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300" : "bg-red-500/20 border border-red-500/30 text-red-300"}`}
                  >
                    {r.isCorrect ? (
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="opacity-70 text-xs block mb-1">
                        Your Answer:
                      </span>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(r.userAnswer),
                        }}
                      />
                    </div>
                  </div>

                  {!r.isCorrect && (
                    <div className="flex items-start gap-2 p-3 rounded-lg text-sm bg-white/5 border border-white/10 text-emerald-400">
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="opacity-70 text-xs block mb-1">
                          Correct Answer:
                        </span>
                        <span
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(r.correctAnswer),
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const LeaderboardView = () => (
    <div className="w-full max-w-4xl mx-auto glass-card rounded-3xl p-6 md:p-8 mt-12 hide-on-print relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" /> Leaderboard
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Top scorers in the village
          </p>
        </div>

        {isHead && (
          <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full text-blue-300 text-xs font-bold">
            <ShieldAlert className="w-3 h-3" /> Head Access Granted
          </div>
        )}
      </div>

      <div className="space-y-3 relative z-10">
        {leaderboard.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            No one has played yet! Be the first!
          </div>
        ) : (
          leaderboard.map((lb, idx) => (
            <div
              key={lb.uid}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${idx === 0 ? "bg-gradient-to-r from-yellow-500/20 to-amber-500/5 border-yellow-500/30 shadow-[0_0_20px_-5px_rgba(234,179,8,0.3)]" : idx === 1 ? "bg-white/10 border-slate-300/30" : idx === 2 ? "bg-amber-700/20 border-amber-700/30" : "bg-white/5 border-white/5"}`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${idx === 0 ? "bg-yellow-500 text-black" : idx === 1 ? "bg-slate-300 text-black" : idx === 2 ? "bg-amber-700 text-white" : "bg-white/10 text-slate-400"}`}
                >
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-white flex items-center gap-2">
                    {lb.name}
                    {idx === 0 && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
                        Champion
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Class: {lb.studentClass}
                  </p>

                  {/* Security: Only Head or Admin can see mobile number */}
                  {isHead && (
                    <p className="text-xs text-blue-400 font-mono mt-1">
                      Mobile: {lb.mobile}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-pink-400 to-purple-400">
                  {lb.score}
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Points
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 bg-[#0f111a] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-pink-900/20 via-purple-900/10 to-transparent pointer-events-none" />

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-6xl mx-auto glass-panel rounded-2xl p-4 flex items-center justify-between z-10 sticky top-4 mb-8 border border-white/10 shadow-2xl hide-on-print"
      >
        <div className="flex items-center gap-4">
          <Link href="/dashboard" replace>
            <button className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
              <span className="text-2xl">🎓</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">
                Student Quiz
              </h1>
              <p className="text-xs text-pink-300">Play, Learn, Rank Up!</p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 pb-20">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            body { background: white !important; }
            .hide-on-print { display: none !important; }
            .print-friendly { max-width: 100% !important; display: block !important; }
            .glass-panel, .glass-card { background: white !important; border: 1px solid #ccc !important; box-shadow: none !important; }
            * { color: black !important; }
          }
        `,
          }}
        />

        {gameState === "loading" && (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-6" />
            <p className="text-pink-400 font-bold animate-pulse">
              Loading Quiz Questions...
            </p>
          </div>
        )}

        {gameState === "intro" && <IntroView />}
        {gameState === "playing" && <PlayingView />}
        {gameState === "result" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ResultView />
            <LeaderboardView />
          </motion.div>
        )}
      </main>
    </div>
  );
}
