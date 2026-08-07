"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { db, storage } from "@/lib/firebase";
import {
  ref,
  onValue,
  push,
  set,
  serverTimestamp,
  remove,
} from "firebase/database";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Share2,
  Upload,
  X,
  Music,
  User,
  Loader2,
  Play,
  Send,
  Trash2,
  Volume2,
  VolumeX,
  Disc,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import ReelCommentsModal from "@/components/reels/ReelCommentsModal";
import ReelUploadModal from "@/components/reels/ReelUploadModal";
import VideoPlayer from "@/components/reels/VideoPlayer";
import ReelOverlay from "@/components/reels/ReelOverlay";

// केवल 10 फुल एचडी अपना निम्बोडा ग्राम पोस्ट्स (1 से 10)
export const DEFAULT_VILLAGE_POSTS = [
  {
    id: "post_1",
    mediaUrl: "/posts/post1.jpg",
    mediaType: "image",
    caption:
      "🌅 स्वागतम् - ग्राम निम्बोडा (343029)\n\nहमारे गांव का स्वर्णिम प्रवेश द्वार और लहलहाते हरे-भरे खेत।\n#ApnaNimboda #Rajasthan #VillageLife #343029",
    authorId: "admin",
    authorHandle: "nimboda_official",
    authorName: "अपना निम्बोडा",
    authorPhoto: "/icon-192.jpg",
    songName: "Kesariya Balam (Rajasthani Desert Flute)",
    artistName: "Marwad Folk Studio",
    audioUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    createdAt: 1785812728489,
    likes: { l1: true, l2: true, l3: true, l4: true, l5: true },
    comments: {
      c1: {
        userId: "guest_suresh",
        userName: "सुरेश चौधरी",
        userPhoto: "",
        text: "बहुत ही भव्य प्रवेश द्वार! जय निम्बोडा 🙏",
        timestamp: 1785812730000,
      },
      c2: {
        userId: "guest_dinesh",
        userName: "दिनेश कुमार",
        userPhoto: "",
        text: "हमारा प्यारा गांव निम्बोडा ❤️",
        timestamp: 1785812735000,
      },
    },
  },
  {
    id: "post_2",
    mediaUrl: "/posts/post2.jpg",
    mediaType: "image",
    caption:
      "💻 डिजिटल भारत - डिजिटल निम्बोडा!\n\nतकनीकी शिक्षा, स्मार्ट डायरेक्टरी और युवा नवाचार से सशक्त ग्राम पंचायत निम्बोडा।\n#DigitalNimboda #YouthEmpowerment #SmartVillage",
    authorId: "admin",
    authorHandle: "digital_nimboda",
    authorName: "डिजिटल निम्बोडा",
    authorPhoto: "/icon-192.jpg",
    songName: "Digital India Ambience & Inspiring Beats",
    artistName: "Youth Energy Studio",
    audioUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    createdAt: 1785812748764,
    likes: { l1: true, l2: true, l3: true, l4: true },
    comments: {
      c1: {
        userId: "guest_ramesh",
        userName: "रमेश जी",
        userPhoto: "",
        text: "डिजिटल निम्बोडा की नई शुरुआत! 🚀",
        timestamp: 1785812750000,
      },
    },
  },
  {
    id: "post_3",
    mediaUrl: "/posts/post3.jpg",
    mediaType: "image",
    caption:
      "🌅 मारवाड़ री पावन धरा - निम्बोडा री सुंदर प्रभात 🦚\n\nचहचहाते राष्ट्रीय पक्षी मोर, शुद्ध शीतल बयार और हमारे गांव की अनुपम प्राकृतिक छटा।\n#NimbodaMorning #PrakritiSondarya #Marwad #ApnaNimboda #343029",
    authorId: "admin",
    authorHandle: "prakriti_nimboda",
    authorName: "प्राकृतिक धरोहर",
    authorPhoto: "/icon-192.jpg",
    songName: "Padharo Mhare Desh (Sarangi & Flute)",
    artistName: "Desert Melody Records",
    audioUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    createdAt: 1785812966979,
    likes: { l1: true, l2: true, l3: true, l4: true, l5: true },
    comments: {
      c1: {
        userId: "guest_prakash",
        userName: "प्रकाश पटेल",
        userPhoto: "",
        text: "हमारे गांव की सुबह सबसे मनमोहक है! 🦚✨",
        timestamp: 1785812970000,
      },
    },
  },
  {
    id: "post_4",
    mediaUrl: "/posts/post4.jpg",
    mediaType: "image",
    caption:
      "📚 GOVT. SENIOR SECONDARY SCHOOL, NIMBODA (BHINMAL) JALORE 🏫\n\nपढ़ेगा निम्बोडा तभी तो बढ़ेगा निम्बोडा! अनुशासन, गुणवत्तापूर्ण शिक्षा और विद्यार्थियों का उज्ज्वल भविष्य।\n#GovtSchoolNimboda #EducationForAll #Bhinmal #Jalore #YouthEducation",
    authorId: "admin",
    authorHandle: "nimboda_school",
    authorName: "राजकीय उच्च माध्यमिक विद्यालय",
    authorPhoto: "/icon-192.jpg",
    songName: "Govt. Sr. Sec. School Anthem (Inspiring Strings)",
    artistName: "Shiksha Mission Vibes",
    audioUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    createdAt: 1785812994243,
    likes: { l1: true, l2: true, l3: true, l4: true, l5: true, l6: true },
    comments: {
      c1: {
        userId: "guest_master",
        userName: "मास्टर जी",
        userPhoto: "",
        text: "शिक्षा ही सबसे बड़ी ताकत है। 🎓",
        timestamp: 1785813000000,
      },
      c2: {
        userId: "guest_student",
        userName: "अनिल सुथार",
        userPhoto: "",
        text: "हमारा प्यारा स्कूल! गर्व है।",
        timestamp: 1785813005000,
      },
    },
  },
  {
    id: "post_5",
    mediaUrl: "/posts/post5.jpg",
    mediaType: "image",
    caption:
      "🎓 युवा शक्ति व उच्च शिक्षा (Youth Inspiration) 🌟\n\nनिम्बोडा के कर्मठ युवाओं का संकल्प: IAS, RAS, शिक्षक, सेना, पुलिस, इंजीनियरिंग व प्रतियोगी परीक्षाओं में सर्वोच्च सफलता हासिल करना! मेहनत ही सफलता की कुंजी है। 💪🔥\n#YouthMotivation #HigherEducation #DreamBig #NimbodaPride",
    authorId: "admin",
    authorHandle: "yuva_prerna",
    authorName: "युवा प्रेरणा मंच निम्बोडा",
    authorPhoto: "/icon-192.jpg",
    songName: "Lakshya Yuva Prerna (Epic Motivational Beats)",
    artistName: "Ambition & Success",
    audioUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    createdAt: 1785813008000,
    likes: { l1: true, l2: true, l3: true, l4: true, l5: true },
    comments: {
      c1: {
        userId: "guest_vikram",
        userName: "विक्रम राजपुरोहित",
        userPhoto: "",
        text: "मेहनत ही सफलता की कुंजी है! 💪",
        timestamp: 1785813012000,
      },
    },
  },
  {
    id: "post_6",
    mediaUrl: "/posts/post6.jpg",
    mediaType: "image",
    caption:
      "🎉 मारवाड़ री शान, निम्बोडा रा पारंपरिक उत्सव एवं घूमर लोक संस्कृति!\n\nरंग-बिरंगी पोशाकें, साफ़ा और ढोल-थाली री धुन। संस्कृति ही हमारी पहचान है।\n#RajasthaniCulture #Ghoomar #Marwad #Heritage",
    authorId: "admin",
    authorHandle: "nimboda_culture",
    authorName: "सांस्कृतिक मंच",
    authorPhoto: "/icon-192.jpg",
    songName: "Ghoomar Rajasthani Folk Rhythm & Dholak",
    artistName: "Marwadi Folk Heritage",
    audioUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    createdAt: 1785813010471,
    likes: { l1: true, l2: true, l3: true, l4: true },
    comments: {
      c1: {
        userId: "guest_kamlesh",
        userName: "कमलेश देवासी",
        userPhoto: "",
        text: "जय मारवाड़! जय राजस्थान! 🚩",
        timestamp: 1785813015000,
      },
    },
  },
  {
    id: "post_7",
    mediaUrl: "/posts/post7.jpg",
    mediaType: "image",
    caption:
      "🌾 जय जवान, जय किसान!\n\nहमारे अन्नदाता किसान भाईयों की अथक मेहनत, सोलर सिंचाई और निम्बोडा की उपजाऊ धरती पर लहलहाती फसलें।\n#KisanEkta #SmartFarming #Nimboda #Annadata",
    authorId: "admin",
    authorHandle: "kisan_nimboda",
    authorName: "किसान मंच निम्बोडा",
    authorPhoto: "/icon-192.jpg",
    songName: "Dharti Dhora Ri (Soulful Desert Strings)",
    artistName: "Folk Rajasthan Tunes",
    audioUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    createdAt: 1785813028174,
    likes: { l1: true, l2: true, l3: true, l4: true, l5: true },
    comments: {
      c1: {
        userId: "guest_bhoma",
        userName: "भोमाराम जी",
        userPhoto: "",
        text: "किसान खुशहाल तो देश खुशहाल! 🌾",
        timestamp: 1785813030000,
      },
    },
  },
  {
    id: "post_8",
    mediaUrl: "/posts/post8.jpg",
    mediaType: "image",
    caption:
      "📮 ई-मित्र एवं डिजिटल नागरिक सेवा केंद्र\n\nसरकारी योजनाओं, प्रमाण पत्र, जन आधार एवं बैंकिंग सेवाओं का लाभ अब सीधे गांव में ही।\n#EMitra #DigitalServices #Nimboda343029",
    authorId: "admin",
    authorHandle: "emitra_nimboda",
    authorName: "ई-मित्र सेवा केंद्र",
    authorPhoto: "/icon-192.jpg",
    songName: "Digital Citizen Ambient Chimes",
    artistName: "Smart Services India",
    audioUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    createdAt: 1785813040000,
    likes: { l1: true, l2: true, l3: true },
    comments: {
      c1: {
        userId: "guest_ashok",
        userName: "अशोक कुमार",
        userPhoto: "",
        text: "घर बैठे सारी सुविधाएं मिल रही हैं। बहुत बढ़िया!",
        timestamp: 1785813045000,
      },
    },
  },
  {
    id: "post_9",
    mediaUrl: "/posts/post9.jpg",
    mediaType: "image",
    caption:
      "🤝 भाईचारा, चौपाल एवं सामाजिक एकता\n\nनिम्बोडा वासियों का अटूट स्नेह, सहयोग, आपसी प्रेम और गांव विकास की सार्थक चर्चा।\n#VillageCommunity #Chaupal #Ekta #ApnaGaon",
    authorId: "admin",
    authorHandle: "yuva_nimboda",
    authorName: "ग्राम चौपाल मंच",
    authorPhoto: "/icon-192.jpg",
    songName: "Banyan Tree Harmony (Peaceful Ektara)",
    artistName: "Village Unity Music",
    audioUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    createdAt: 1785813050000,
    likes: { l1: true, l2: true, l3: true, l4: true, l5: true },
    comments: {
      c1: {
        userId: "guest_mukesh",
        userName: "मुकेश सुथार",
        userPhoto: "",
        text: "एकता में ही शक्ति है। जय निम्बोडा!",
        timestamp: 1785813055000,
      },
    },
  },
  {
    id: "post_10",
    mediaUrl: "/posts/post10.jpg",
    mediaType: "image",
    caption:
      "🛕 श्री निम्बोडा धाम एवं ऐतिहासिक प्राचीन मंदिर (343029)\n\nसुख, शांति, समृद्धि और सर्वकल्याण की पावन मंगल कामना।\n#NimbodaDham #SacredTemple #Bhinmal #Rajasthan #Devotion",
    authorId: "admin",
    authorHandle: "heritage_nimboda",
    authorName: "श्री निम्बोडा धाम",
    authorPhoto: "/icon-192.jpg",
    songName: "Achyutam Keshavam (Morning Aarti & Temple Bells)",
    artistName: "Bhakti Nimboda Studio",
    audioUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    createdAt: 1785813070000,
    likes: { l1: true, l2: true, l3: true, l4: true, l5: true, l6: true },
    comments: {
      c1: {
        userId: "guest_shanti",
        userName: "शांतिलाल जी",
        userPhoto: "",
        text: "जय हो निम्बोडा धाम की! सबका कल्याण हो 🙏",
        timestamp: 1785813075000,
      },
    },
  },
  {
    id: "post_11",
    mediaUrl: "/posts/anti_drug_1.jpg",
    mediaType: "image",
    caption:
      "🚫 नशा नाश का द्वार है! 🚫\n\nशराब, स्मैक और MD जैसे नशे सिर्फ एक इंसान को नहीं, पूरे हंसते-खेलते परिवार को खत्म कर देते हैं। अपने गाँव निम्बोड़ा को नशे से मुक्त बनाएँ।\n#SayNoToDrugs #AntiDrug #Nimboda #Awareness #ApnaNimboda",
    authorId: "admin",
    authorHandle: "nimboda_awareness",
    authorName: "गाँव जागरूकता मंच",
    authorPhoto: "/icon-192.jpg",
    songName: "Aarambh Hai Prachand (Motivational)",
    artistName: "Youth Awakening",
    audioUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    createdAt: 1785901478549,
    likes: { l1: true, l2: true, l3: true },
    comments: {},
  },
  {
    id: "post_12",
    mediaUrl: "/posts/anti_drug_2.jpg",
    mediaType: "image",
    caption:
      "⛓️ नशे की जंजीरें तोड़ो, भविष्य की ओर दौड़ो! 🏃‍♂️\n\nयुवाओं से अपील: स्मैक और MD की लत को छोड़ें और खेल-कूद, पढ़ाई और अपने भविष्य पर ध्यान दें। आपका भविष्य आपके हाथ में है।\n#YouthPower #DrugFreeNimboda #Future",
    authorId: "admin",
    authorHandle: "nimboda_awareness",
    authorName: "गाँव जागरूकता मंच",
    authorPhoto: "/icon-192.jpg",
    songName: "Zindagi Ek Safar (Inspiring Beats)",
    artistName: "Hope Records",
    audioUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    createdAt: 1785901502516,
    likes: { l1: true, l2: true, l3: true, l4: true },
    comments: {},
  },
  {
    id: "post_13",
    mediaUrl: "/posts/anti_drug_3.jpg",
    mediaType: "image",
    caption:
      "🤝 गाँव की एकता - नशे की हार! 🤝\n\nगाँव के बुजुर्ग और युवा आज एक साथ खड़े हैं। आइए मिलकर शपथ लें कि अपने प्यारे गाँव निम्बोड़ा में किसी भी तरह का नशा नहीं पनपने देंगे।\n#Unity #MarwadiCulture #ApnaNimboda #SayNoToDrugs",
    authorId: "admin",
    authorHandle: "nimboda_awareness",
    authorName: "गाँव जागरूकता मंच",
    authorPhoto: "/icon-192.jpg",
    songName: "Maa Tharo Mharo (Emotional Folk)",
    artistName: "Desert Melody Records",
    audioUrl:
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    createdAt: 1785901544337,
    likes: { l1: true, l2: true, l3: true, l4: true, l5: true },
    comments: {},
  },
];

// Component for Reel
const Reel = ({
  reel,
  isActive,
  onLike,
  currentUserId,
  onCommentClick,
  isAudioPlaying,
  onToggleAudio,
}: any) => {
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const lastTapRef = useRef<number>(0);
  const isLiked = currentUserId && reel.likes && reel.likes[currentUserId];

  const isVideo = reel.mediaType === "video";
  const mediaSrc = reel.mediaUrl || reel.videoUrl;
  const songTitle = reel.songName || "Rajasthani Folk & Ambient Beats";
  const artistTitle = reel.artistName || "Apna Nimboda Music";

  // Double tap to like
  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!isLiked) {
        onLike(reel.id);
      }
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 900);
    }
    lastTapRef.current = now;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${reel.authorName || "Post"} - APNA NIMBODA`,
          text: reel.caption,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(reel.caption + "\n\n" + window.location.href)}`,
        "_blank",
      );
    }
  };

  return (
    <div
      onClick={handleDoubleTap}
      className="relative w-full h-full snap-start snap-always bg-black flex justify-center items-center overflow-hidden select-none"
    >
      <VideoPlayer
        isVideo={isVideo}
        mediaSrc={mediaSrc}
        isActive={isActive}
        caption={reel.caption}
        showHeartAnim={showHeartAnim}
      />
      <ReelOverlay
        reel={reel}
        isLiked={isLiked}
        onLike={onLike}
        onCommentClick={onCommentClick}
        handleShare={handleShare}
        isAudioPlaying={isAudioPlaying}
        isActive={isActive}
        onToggleAudio={onToggleAudio}
        songTitle={songTitle}
        artistTitle={artistTitle}
      />
    </div>
  );
};

export default function ReelsPage() {
  const { user, isAdmin } = useAuth();
  const [reels, setReels] = useState<any[]>(DEFAULT_VILLAGE_POSTS);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Upload State
  const [showUpload, setShowUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [songName, setSongName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Profile Handle State
  const [userHandle, setUserHandle] = useState<string | null>(null);

  // Comment Drawer State
  const [activeCommentReel, setActiveCommentReel] = useState<any | null>(null);
  const [commentText, setCommentText] = useState("");

  // Audio Playback State
  const [isAudioPlaying, setIsAudioPlaying] = useState(true);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Sync activeCommentReel with latest reels data so comments appear instantly
  useEffect(() => {
    if (activeCommentReel) {
      const updated = reels.find((r) => r.id === activeCommentReel.id);
      if (updated) {
        setActiveCommentReel(updated);
      }
    }
  }, [reels]);

  // Switch audio track when active reel changes
  useEffect(() => {
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio();
      audioPlayerRef.current.loop = true;
    }

    const currentReel = reels[activeIndex];
    if (!currentReel) return;
    const targetAudio = currentReel.audioUrl;

    if (targetAudio && audioPlayerRef.current.src !== targetAudio) {
      audioPlayerRef.current.src = targetAudio;
      audioPlayerRef.current.load();
    }

    if (isAudioPlaying && !document.hidden) {
      const playPromise = audioPlayerRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setNeedsInteraction(false))
          .catch(() => setNeedsInteraction(true));
      }
    } else {
      audioPlayerRef.current.pause();
    }
  }, [activeIndex, reels, isAudioPlaying]);

  // Audio Lifecycle: Auto-stop when exiting app or switching tabs
  useEffect(() => {
    const unlockAudio = () => {
      if (audioPlayerRef.current && isAudioPlaying && !document.hidden) {
        audioPlayerRef.current
          .play()
          .then(() => setNeedsInteraction(false))
          .catch(() => setNeedsInteraction(true));
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
        }
      } else {
        if (isAudioPlaying && audioPlayerRef.current) {
          audioPlayerRef.current
            .play()
            .then(() => setNeedsInteraction(false))
            .catch(() => setNeedsInteraction(true));
        }
      }
    };

    const handleWindowBlur = () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    };

    const handleWindowFocus = () => {
      if (isAudioPlaying && audioPlayerRef.current && !document.hidden) {
        audioPlayerRef.current
          .play()
          .then(() => setNeedsInteraction(false))
          .catch(() => setNeedsInteraction(true));
      }
    };

    const handlePageHide = () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = "";
      }
    };

    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true });
    window.addEventListener("scroll", unlockAudio, { once: true });

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("scroll", unlockAudio);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("pagehide", handlePageHide);

      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = "";
      }
    };
  }, [isAudioPlaying]);

  const toggleAudio = () => {
    if (isAudioPlaying) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      setIsAudioPlaying(false);
      showToast("🔇 संगीत म्यूट (OFF)");
    } else {
      setIsAudioPlaying(true);
      if (audioPlayerRef.current) {
        audioPlayerRef.current.play().catch(() => {});
      }
      showToast("🎵 संगीत चालू (ON)");
    }
  };

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !localStorage.getItem("nimboda_guest_id")
    ) {
      localStorage.setItem(
        "nimboda_guest_id",
        "guest_" + Math.random().toString(36).substring(2, 9),
      );
    }

    if (user) {
      const handleRef = ref(db, `users/${user.uid}/handle`);
      onValue(handleRef, (snap) => {
        if (snap.exists()) {
          setUserHandle(snap.val());
        } else if (isAdmin) {
          setUserHandle("admin");
        }
      });
    }

    // Fetch Reels from Firebase
    const reelsRef = ref(db, "reels");
    const unsub = onValue(reelsRef, (snap) => {
      const data = snap.val();
      if (data) {
        const userUploadedReels = Object.entries(data)
          .map(([id, val]: any) => ({ id, ...val }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        const updatedDefaultPosts = DEFAULT_VILLAGE_POSTS.map((post) => {
          if (data[post.id]) {
            return {
              ...post,
              likes: { ...post.likes, ...data[post.id].likes },
              comments: { ...post.comments, ...data[post.id].comments },
            };
          }
          return post;
        });

        const customUploads = userUploadedReels.filter(
          (r) =>
            !r.id.startsWith("post_") &&
            !r.id.startsWith("hero_post_") &&
            !r.id.startsWith("village_post_") &&
            !r.id.startsWith("default_post_"),
        );
        setReels([...customUploads, ...updatedDefaultPosts]);
      } else {
        setReels(DEFAULT_VILLAGE_POSTS);
      }
    });

    return () => unsub();
  }, [user, isAdmin]);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, clientHeight } = containerRef.current;
      const index = Math.round(scrollTop / clientHeight);
      if (index !== activeIndex && index >= 0 && index < reels.length) {
        setActiveIndex(index);
      }
    }
  };

  const handleUpload = async () => {
    if (!user) return alert("Login required!");
    if (!isAdmin) return alert("Only admins can upload posts.");
    if (!uploadFile) return alert("Select a file!");

    const isImage = uploadFile.type.startsWith("image/");
    setUploading(true);

    try {
      const ext = isImage ? "jpg" : "mp4";
      const fileName = `reels/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const sRef = storageRef(storage, fileName);
      const uploadTask = uploadBytesResumable(sRef, uploadFile);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error(error);
          alert("Upload failed. Try again.");
          setUploading(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const newReelRef = push(ref(db, "reels"));

          await set(newReelRef, {
            authorId: user.uid,
            authorName: user.displayName || user.name || "Admin",
            authorHandle: userHandle || "admin",
            authorPhoto: user.displayPhoto || "",
            mediaUrl: downloadURL,
            mediaType: isImage ? "image" : "video",
            caption: caption.trim(),
            songName: songName.trim() || "Apna Nimboda Original Audio",
            artistName: "Nimboda Studio",
            createdAt: serverTimestamp(),
            likes: {},
            comments: {},
          });

          setUploading(false);
          setShowUpload(false);
          setUploadFile(null);
          setCaption("");
          setSongName("");
          setUploadProgress(0);
          showToast(
            isImage
              ? "📸 फोटो सफलतापूर्वक पोस्ट हो गई!"
              : "🎬 वीडियो रील सफलतापूर्वक पोस्ट हो गई!",
          );
        },
      );
    } catch (error) {
      console.error(error);
      setUploading(false);
    }
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleLike = async (reelId: string) => {
    let uid = user?.uid;
    if (!uid && typeof window !== "undefined") {
      uid = localStorage.getItem("nimboda_guest_id") || "";
    }
    if (!uid) return;

    const reel = reels.find((r) => r.id === reelId);
    if (!reel) return;

    const isLiked = reel.likes && reel.likes[uid];
    const likeRef = ref(db, `reels/${reelId}/likes/${uid}`);

    if (isLiked) {
      await set(likeRef, null);
    } else {
      await set(likeRef, true);
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim() || !activeCommentReel) return;

    const currentUid =
      user?.uid ||
      (typeof window !== "undefined"
        ? localStorage.getItem("nimboda_guest_id")
        : "guest_" + Date.now());
    let commenterName = user?.displayName || user?.name;
    if (!commenterName && typeof window !== "undefined") {
      commenterName =
        localStorage.getItem("nimboda_guest_name") || "निम्बोड़ा वासी";
    }

    const commentRef = ref(db, `reels/${activeCommentReel.id}/comments`);
    await push(commentRef, {
      userId: currentUid,
      userName: commenterName || "निम्बोड़ा वासी",
      userPhoto: user?.displayPhoto || "",
      text: commentText.trim(),
      timestamp: serverTimestamp(),
    });

    setCommentText("");
  };

  const handleDeleteComment = async (commentId: string, authorUid: string) => {
    if (!activeCommentReel) return;
    const currentUid =
      user?.uid ||
      (typeof window !== "undefined"
        ? localStorage.getItem("nimboda_guest_id")
        : "");

    if (currentUid !== authorUid && !isAdmin) {
      return alert("आप केवल अपना कमेंट हटा सकते हैं।");
    }

    if (window.confirm("क्या आप वाकई यह कमेंट हटाना चाहते हैं?")) {
      const commentRef = ref(
        db,
        `reels/${activeCommentReel.id}/comments/${commentId}`,
      );
      if (isAdmin) {
        await remove(commentRef);
      } else {
        await set(
          ref(
            db,
            `reels/${activeCommentReel.id}/comments/${commentId}/deleted`,
          ),
          true,
        );
      }
      showToast("कमेंट हटा दिया गया!");
    }
  };

  const currentUid =
    user?.uid ||
    (typeof window !== "undefined"
      ? localStorage.getItem("nimboda_guest_id")
      : "");

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden font-sans select-none">
      {/* Top Floating Navigation Header */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-3.5 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none">
        <Link
          href="/dashboard"
          className="pointer-events-auto w-9 h-9 rounded-full bg-black/70 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-black/90 transition-colors shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-2">
          <h1 className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-amber-200 drop-shadow-md flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-400" /> APNA NIMBODA
          </h1>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleAudio}
            title={isAudioPlaying ? "म्यूट करें" : "संगीत चालू करें"}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg backdrop-blur-md border ${
              isAudioPlaying
                ? "bg-amber-500/90 border-amber-300 text-black animate-pulse"
                : "bg-black/70 border-white/20 text-slate-300"
            }`}
          >
            {isAudioPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-black" />
                <span>ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span>OFF</span>
              </>
            )}
          </button>

          {isAdmin && (
            <button
              onClick={async () => {
                // Request native runtime permissions (Camera & Mic) like Instagram
                try {
                  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    stream.getTracks().forEach(track => track.stop());
                  }
                } catch(e) {}
                setShowUpload(true);
              }}
              className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-opacity"
            >
              <Upload className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Reels Feed (Only 10 Village Posts) */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-full flex-1 overflow-y-auto snap-y snap-mandatory scrollbar-hide no-scrollbar relative"
        style={{ scrollBehavior: "smooth" }}
      >
        {reels.map((reel, index) => (
          <Reel
            key={reel.id}
            reel={reel}
            isActive={index === activeIndex}
            onLike={handleLike}
            currentUserId={currentUid}
            onCommentClick={setActiveCommentReel}
            isAudioPlaying={isAudioPlaying}
            onToggleAudio={toggleAudio}
          />
        ))}
      </div>

      {/* Needs Interaction Overlay (Removed by user request) */}
      <AnimatePresence>
        {/* Intentionally left blank so no popup blocks the screen */}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999999] bg-black/95 border border-amber-400/50 text-white px-5 py-2 rounded-full shadow-2xl backdrop-blur-md text-xs font-bold flex items-center gap-2"
          >
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comments Drawer */}
      <ReelCommentsModal
        activeCommentReel={activeCommentReel}
        setActiveCommentReel={setActiveCommentReel}
        isAdmin={isAdmin}
        currentUid={currentUid}
        handleDeleteComment={handleDeleteComment}
        user={user}
        commentText={commentText}
        setCommentText={setCommentText}
        handlePostComment={handlePostComment}
      />

      {/* Upload Modal for Admin */}
      <ReelUploadModal
        showUpload={showUpload}
        setShowUpload={setShowUpload}
        isAdmin={isAdmin}
        uploadFile={uploadFile}
        setUploadFile={setUploadFile}
        songName={songName}
        setSongName={setSongName}
        caption={caption}
        setCaption={setCaption}
        handleUpload={handleUpload}
        uploading={uploading}
        uploadProgress={uploadProgress}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
        }}
      />
    </div>
  );
}
