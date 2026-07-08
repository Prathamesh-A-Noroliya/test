import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Camera, CloudUpload, Leaf, Microscope, TreeDeciduous,
  X, CheckCircle2, Loader2, ImageIcon, Plus, AlertCircle,
  MapPin, Sprout,
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useScan } from "@/lib/scan-store";

const CROP_TYPES = [
  "Rice", "Wheat", "Cotton", "Sugarcane", "Maize", "Soybean",
  "Groundnut", "Mustard", "Tomato", "Potato", "Onion", "Chickpea",
  "Lentil", "Mango", "Banana", "Other",
];

const SOIL_TYPES = [
  "Alluvial", "Black (Regur)", "Red & Yellow", "Laterite",
  "Arid (Desert)", "Loamy", "Sandy", "Clay", "Silt",
];

const GROWTH_STAGES = [
  "Seedling (0–3 weeks)", "Vegetative (3–6 weeks)", "Tillering / Branching",
  "Flowering / Booting", "Grain Filling / Fruiting", "Maturity / Harvest",
];

type PhotoSlot = "whole" | "leaf" | "soil";

const PHOTO_SLOTS: Array<{
  id: PhotoSlot; icon: React.ElementType; title: string; hint: string; color: string; bg: string; border: string;
}> = [
  { id: "whole", icon: TreeDeciduous, title: "Whole Plant", hint: "Step back 1–2 m, capture full plant + surroundings", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  { id: "leaf", icon: Leaf, title: "Leaf Close-up", hint: "15–20 cm away — show spots, discolouration, texture", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  { id: "soil", icon: ImageIcon, title: "Soil / Root", hint: "Show plant base, root zone and surrounding soil", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
];

const STAGES = [
  "Uploading photos…",
  "Pre-processing images…",
  "Running multi-angle AI model…",
  "Cross-referencing disease database…",
  "Generating dual diagnosis…",
  "Compiling treatment report…",
];

export default function ScanPage() {
  const [, navigate] = useLocation();
  const { setScanData } = useScan();

  const [cropType, setCropType] = useState("");
  const [soilType, setSoilType] = useState("");
  const [growthStage, setGrowthStage] = useState("");
  const [fieldName, setFieldName] = useState("");

  const [photos, setPhotos] = useState<Record<PhotoSlot, { file: File; url: string } | null>>({
    whole: null, leaf: null, soil: null,
  });
  const [dragOver, setDragOver] = useState<PhotoSlot | null>(null);
  const [errors, setErrors] = useState<Record<PhotoSlot, string>>({ whole: "", leaf: "", soil: "" });
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const fileRefs = {
    whole: useRef<HTMLInputElement>(null),
    leaf: useRef<HTMLInputElement>(null),
    soil: useRef<HTMLInputElement>(null),
  };

  const validateFile = (f: File, slot: PhotoSlot): boolean => {
    if (!f.type.startsWith("image/")) {
      setErrors((prev) => ({ ...prev, [slot]: "Please upload a valid image (JPG, PNG, WEBP)." }));
      return false;
    }
    if (f.size > 15 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, [slot]: "File is too large. Max 15 MB." }));
      return false;
    }
    setErrors((prev) => ({ ...prev, [slot]: "" }));
    return true;
  };

  const handleFile = (slot: PhotoSlot, f: File) => {
    if (!validateFile(f, slot)) return;
    setPhotos((prev) => ({ ...prev, [slot]: { file: f, url: URL.createObjectURL(f) } }));
  };

  const clearPhoto = (slot: PhotoSlot) => {
    setPhotos((prev) => ({ ...prev, [slot]: null }));
    if (fileRefs[slot].current) fileRefs[slot].current!.value = "";
  };

  const handleDrop = useCallback((slot: PhotoSlot, e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(slot, f);
  }, []);

  const photosUploaded = PHOTO_SLOTS.filter((s) => photos[s.id] !== null).length;
  const allPhotos = photosUploaded === 3;
  const allFields = cropType && soilType && growthStage;
  const canAnalyze = allPhotos && allFields;

  const runAnalysis = async () => {
    setSubmitAttempted(true);
    if (!canAnalyze) return;
    setAnalyzing(true);
    setProgress(0);
    setStage(0);

    const totalDuration = 4000;
    for (let i = 0; i <= 100; i++) {
      await new Promise((r) => setTimeout(r, totalDuration / 100));
      setProgress(i);
      setStage(Math.min(Math.floor((i / 100) * STAGES.length), STAGES.length - 1));
    }

    setScanData({
      photos: PHOTO_SLOTS.map((s) => ({
        url: photos[s.id]!.url,
        name: photos[s.id]!.file.name,
        type: s.id,
      })),
      cropType,
      soilType,
      growthStage,
      fieldName: fieldName || "My Field",
    });

    navigate("/scan/result");
  };

  const missingFields = submitAttempted && !canAnalyze;

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="space-y-5"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Crop Scan</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Upload 3 photos and fill all details — BHOOMI AI will give you 2 possible diagnoses.
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn("font-bold", allFields ? "text-emerald-600" : "text-foreground")}>
              {allFields ? "✓" : "①"} Field Info
            </span>
          </div>
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all duration-500", allFields ? "bg-emerald-500 w-full" : "bg-primary w-0")} />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className={cn("font-bold", allPhotos ? "text-emerald-600" : "text-foreground")}>
              {allPhotos ? "✓" : "②"} 3 Photos ({photosUploaded}/3)
            </span>
          </div>
          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(photosUploaded / 3) * 100}%` }} />
          </div>
          <span className={cn("text-xs font-bold", canAnalyze ? "text-emerald-600" : "text-muted-foreground")}>
            ③ Analyse
          </span>
        </div>

        {/* ── Field Information ─────────────────────────── */}
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Sprout className="h-3.5 w-3.5" /> Crop & Field Information
              <span className="text-red-500 ml-0.5">* Required</span>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Crop Type */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Leaf className="h-3.5 w-3.5 text-primary" /> Crop Type <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={setCropType} value={cropType}>
                  <SelectTrigger className={cn("h-11 rounded-xl", submitAttempted && !cropType && "border-red-400 ring-1 ring-red-300")}>
                    <SelectValue placeholder="Select your crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {CROP_TYPES.map((c) => (
                      <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {submitAttempted && !cropType && <p className="text-red-500 text-[11px]">Please select a crop type</p>}
              </div>

              {/* Soil Type */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <ImageIcon className="h-3.5 w-3.5 text-amber-500" /> Soil Type <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={setSoilType} value={soilType}>
                  <SelectTrigger className={cn("h-11 rounded-xl", submitAttempted && !soilType && "border-red-400 ring-1 ring-red-300")}>
                    <SelectValue placeholder="Select soil type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOIL_TYPES.map((s) => (
                      <SelectItem key={s} value={s.toLowerCase().replace(/[\s/()&]/g, "-")}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {submitAttempted && !soilType && <p className="text-red-500 text-[11px]">Please select a soil type</p>}
              </div>

              {/* Growth Stage */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <Sprout className="h-3.5 w-3.5 text-emerald-500" /> Growth Stage <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={setGrowthStage} value={growthStage}>
                  <SelectTrigger className={cn("h-11 rounded-xl", submitAttempted && !growthStage && "border-red-400 ring-1 ring-red-300")}>
                    <SelectValue placeholder="Select growth stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {GROWTH_STAGES.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {submitAttempted && !growthStage && <p className="text-red-500 text-[11px]">Please select a growth stage</p>}
              </div>

              {/* Field Name (optional) */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-500" /> Field Name
                  <span className="text-muted-foreground text-[11px] font-normal">(optional)</span>
                </Label>
                <Input
                  placeholder="e.g. Field A, North Plot…"
                  className="h-11 rounded-xl"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 3 Photo Upload Slots ──────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              Upload 3 Photos <span className="text-red-500">* All Required</span>
            </p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={cn("font-bold tabular-nums", allPhotos ? "text-emerald-600" : "text-foreground")}>{photosUploaded}/3</span> uploaded
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PHOTO_SLOTS.map(({ id, icon: Icon, title, hint, color, bg, border }) => {
              const photo = photos[id];
              const hasError = submitAttempted && !photo;
              const isDragging = dragOver === id;

              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: PHOTO_SLOTS.findIndex((s) => s.id === id) * 0.1 }}
                >
                  <input
                    ref={fileRefs[id]}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) handleFile(id, e.target.files[0]); }}
                  />

                  <AnimatePresence mode="wait">
                    {photo ? (
                      /* Photo uploaded — show preview */
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="relative rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-sm"
                      >
                        <img src={photo.url} alt={title} className="w-full h-36 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2.5">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <p className="text-white text-[11px] font-semibold truncate">{title}</p>
                          </div>
                        </div>
                        {!analyzing && (
                          <button
                            onClick={() => clearPhoto(id)}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </motion.div>
                    ) : (
                      /* Empty upload zone */
                      <motion.div
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onDrop={(e) => handleDrop(id, e)}
                        onDragOver={(e) => { e.preventDefault(); setDragOver(id); }}
                        onDragLeave={() => setDragOver(null)}
                        onClick={() => fileRefs[id].current?.click()}
                        className={cn(
                          "border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center gap-2.5",
                          isDragging ? `${border} ${bg} scale-[1.02]` : hasError ? "border-red-400 bg-red-50" : "border-border hover:border-primary/40 hover:bg-muted/40",
                          "h-36 justify-center"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", isDragging ? bg : hasError ? "bg-red-100" : "bg-muted")}>
                          {hasError ? <AlertCircle className="h-5 w-5 text-red-500" /> : <Icon className={cn("h-5 w-5", isDragging ? color : "text-muted-foreground")} />}
                        </div>
                        <div>
                          <p className={cn("text-xs font-bold", hasError ? "text-red-600" : "text-foreground")}>{title}</p>
                          <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 hidden sm:block">{hint}</p>
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full",
                          hasError ? "bg-red-100 text-red-600" : "bg-muted text-muted-foreground"
                        )}>
                          <Plus className="h-3 w-3" />
                          {hasError ? "Required" : "Add photo"}
                        </div>
                        {errors[id] && <p className="text-red-500 text-[10px]">{errors[id]}</p>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {submitAttempted && !allPhotos && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-3 py-2.5"
            >
              <AlertCircle className="h-4 w-4 shrink-0" />
              Please upload all 3 photos: Whole Plant, Leaf Close-up, and Soil/Root for accurate diagnosis.
            </motion.div>
          )}
        </div>

        {/* Camera quick capture tip */}
        <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-3">
          <Camera className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed">
            <strong>Mobile tip:</strong> Tapping an upload slot will open your camera directly. Take each photo type in sequence for the most accurate AI analysis. Ensure good lighting and steady hands.
          </p>
        </div>

        {/* Validation summary */}
        {missingFields && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2"
          >
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-800">
              <p className="font-semibold mb-1">Please complete all required fields before analysing:</p>
              <ul className="space-y-0.5 list-disc list-inside">
                {!cropType && <li>Crop type</li>}
                {!soilType && <li>Soil type</li>}
                {!growthStage && <li>Growth stage</li>}
                {!allPhotos && <li>All 3 photos ({photosUploaded}/3 uploaded)</li>}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Analyse Button / Progress */}
        <AnimatePresence mode="wait">
          {analyzing ? (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            >
              <Card className="rounded-2xl border-border/60 shadow-sm">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                      <Loader2 className="h-5 w-5 text-primary" />
                    </motion.div>
                    <div className="flex-1">
                      <motion.p key={stage} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-semibold text-foreground">
                        {STAGES[stage]}
                      </motion.p>
                      <p className="text-xs text-muted-foreground">BHOOMI AI is analysing your {photosUploaded} photos…</p>
                    </div>
                    <span className="text-sm font-bold text-primary tabular-nums">{progress}%</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    {STAGES.map((_, i) => (
                      <motion.div
                        key={i}
                        className={cn("w-2 h-2 rounded-full transition-colors duration-300", i <= stage ? "bg-primary" : "bg-muted")}
                        animate={i === stage ? { scale: [1, 1.4, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-4">
              <Button
                onClick={runAnalysis}
                className="w-full h-13 rounded-xl text-base font-bold gap-2 shadow-sm"
                size="lg"
              >
                <Microscope className="h-5 w-5" />
                Analyse with BHOOMI AI — {photosUploaded}/3 photos
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-2">
                All 3 photos + crop details required · AI returns 2 possible diagnoses
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AppLayout>
  );
}
