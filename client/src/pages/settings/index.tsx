import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ChevronLeft,
    Camera,
    Loader2,
    Check,
    X,
    Palette,
    User as UserIcon,
    Sun,
    Moon,
    Monitor,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import AvatarWithBadge from "@/components/avatar-with-badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const WALLPAPER_COLORS = [
    { name: "Default", value: null, class: "bg-muted/40" },
    { name: "Slate", value: "#0f172a", class: "bg-[#0f172a]" },
    { name: "Emerald", value: "#064e3b", class: "bg-[#064e3b]" },
    { name: "Rose", value: "#4c0519", class: "bg-[#4c0519]" },
    { name: "Indigo", value: "#1e1b4b", class: "bg-[#1e1b4b]" },
    { name: "Amber", value: "#451a03", class: "bg-[#451a03]" },
    { name: "Violet", value: "#2e1065", class: "bg-[#2e1065]" },
    { name: "Teal", value: "#134e4a", class: "bg-[#134e4a]" },
    { name: "Cyan", value: "#164e63", class: "bg-[#164e63]" },
];

const GlassCard = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
        className={cn(
            "p-6 rounded-3xl bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl shadow-black/5",
            className
        )}
    >
        {children}
    </motion.div>
);

const Settings = () => {
    const navigate = useNavigate();
    const { user, updateProfile } = useAuth();
    const { theme, setTheme } = useTheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(user?.name || "");
    const [about, setAbout] = useState(user?.about || "");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingAbout, setIsEditingAbout] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatar(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveField = async (field: "name" | "about" | "avatar" | "wallpaper", value: string | null) => {
        setIsUpdating(true);
        const res = await updateProfile({ [field]: value });
        if (res.success) {
            toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
            if (field === "name") setIsEditingName(false);
            if (field === "about") setIsEditingAbout(false);
            if (field === "avatar") setAvatar(null);
        } else {
            toast.error(res.error || `Failed to update ${field}`);
        }
        setIsUpdating(false);
    };

    return (
        <div className="flex-1 h-full bg-background flex flex-col relative overflow-hidden">
            {/* Dynamic Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2" />

            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="h-20 border-b border-white/10 flex items-center px-8 gap-6 sticky top-0 bg-background/60 backdrop-blur-2xl z-20"
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-full hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft className="size-6" />
                </Button>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldCheck className="size-3 text-primary" />
                        Personal Account
                    </p>
                </div>
            </motion.div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                <div className="max-w-3xl mx-auto p-8 md:p-12 space-y-10">

                    {/* Hero Section */}
                    <section className="flex flex-col items-center gap-8 mb-4">
                        <div className="relative group">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                className="relative z-10"
                            >
                                <AvatarWithBadge
                                    name={user?.name || ""}
                                    src={avatar || user?.avatar || ""}
                                    size="size-40 md:size-48"
                                    className="text-5xl shadow-[0_0_50px_rgba(0,0,0,0.1)] border-8 border-white/5"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md"
                                >
                                    <Camera className="size-10 mb-2 transform scale-90 group-hover:scale-100 transition-transform" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/80">
                                        Update Photo
                                    </span>
                                </button>
                            </motion.div>

                            {/* Decorative Rings */}
                            <div className="absolute inset-0 -m-4 border border-primary/20 rounded-full animate-pulse z-0" />
                            <div className="absolute inset-0 -m-8 border border-primary/10 rounded-full z-0 opacity-50" />

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                        </div>

                        <AnimatePresence>
                            {avatar && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="flex gap-3"
                                >
                                    <Button
                                        size="lg"
                                        onClick={() => handleSaveField("avatar", avatar)}
                                        disabled={isUpdating}
                                        className="rounded-full px-8 bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                                    >
                                        {isUpdating ? <Loader2 className="size-4 animate-spin mr-2" /> : <Check className="size-4 mr-2" />}
                                        Save New Photo
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="ghost"
                                        onClick={() => setAvatar(null)}
                                        disabled={isUpdating}
                                        className="rounded-full px-8 hover:bg-white/10"
                                    >
                                        Cancel
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <GlassCard delay={0.1}>
                            <div className="flex items-center gap-3 mb-6 text-primary">
                                <UserIcon className="size-5" />
                                <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Profile Info</h3>
                            </div>

                            <div className="space-y-6">
                                {/* Name */}
                                <div className="space-y-2.5">
                                    <Label className="text-xs font-bold text-muted-foreground px-1">Display Name</Label>
                                    <div className="relative group">
                                        {isEditingName ? (
                                            <div className="flex gap-2">
                                                <Input
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    autoFocus
                                                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary/40"
                                                    onKeyDown={(e) => e.key === "Enter" && handleSaveField("name", name)}
                                                />
                                                <Button size="icon" onClick={() => handleSaveField("name", name)} disabled={isUpdating} className="rounded-xl h-12 w-12 bg-primary">
                                                    {isUpdating ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => { setIsEditingName(false); setName(user?.name || ""); }} className="rounded-xl h-12 w-12 hover:bg-white/5 text-muted-foreground">
                                                    <X className="size-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => setIsEditingName(true)}
                                                className="h-12 flex items-center px-4 rounded-xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 cursor-pointer transition-all group/item"
                                            >
                                                <span className="flex-1 font-semibold tracking-tight">{user?.name}</span>
                                                <Palette className="size-4 text-primary opacity-0 group-hover/item:opacity-100 transition-opacity" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* About */}
                                <div className="space-y-2.5">
                                    <Label className="text-xs font-bold text-muted-foreground px-1">About</Label>
                                    <div className="relative">
                                        {isEditingAbout ? (
                                            <div className="flex gap-2">
                                                <Input
                                                    value={about}
                                                    onChange={(e) => setAbout(e.target.value)}
                                                    autoFocus
                                                    className="h-12 bg-white/5 border-white/10 rounded-xl"
                                                    onKeyDown={(e) => e.key === "Enter" && handleSaveField("about", about)}
                                                />
                                                <Button size="icon" onClick={() => handleSaveField("about", about)} disabled={isUpdating} className="rounded-xl h-12 w-12 bg-primary">
                                                    {isUpdating ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => { setIsEditingAbout(false); setAbout(user?.about || ""); }} className="rounded-xl h-12 w-12 hover:bg-white/5 text-muted-foreground">
                                                    <X className="size-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => setIsEditingAbout(true)}
                                                className="min-h-12 flex items-start py-3 px-4 rounded-xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 cursor-pointer transition-all group/item"
                                            >
                                                <span className="flex-1 text-sm text-muted-foreground font-medium leading-relaxed">{user?.about}</span>
                                                <Palette className="size-4 text-primary opacity-0 group-hover/item:opacity-100 transition-opacity mt-0.5" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard delay={0.2} className="flex flex-col">
                            <div className="flex items-center gap-3 mb-6 text-primary">
                                <Sun className="size-5" />
                                <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Appearance</h3>
                            </div>

                            <div className="grid grid-cols-1 gap-3 flex-1">
                                {[
                                    { name: "Light Mode", icon: Sun, value: "light", desc: "Classic bright look" },
                                    { name: "Dark Mode", icon: Moon, value: "dark", desc: "Restful dark colors" },
                                    { name: "System", icon: Monitor, value: "system", desc: "Follow OS settings" },
                                ].map((t) => (
                                    <button
                                        key={t.value}
                                        onClick={() => setTheme(t.value as any)}
                                        className={cn(
                                            "flex items-center p-4 rounded-2xl border transition-all relative group",
                                            theme === t.value
                                                ? "border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(var(--primary),0.1)]"
                                                : "border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "size-10 rounded-xl flex items-center justify-center mr-4 transition-colors",
                                            theme === t.value ? "bg-primary text-primary-foreground" : "bg-white/5 text-muted-foreground group-hover:bg-white/10"
                                        )}>
                                            <t.icon className="size-5" />
                                        </div>
                                        <div className="flex flex-col items-start translate-y-[-1px]">
                                            <span className={cn("text-sm font-bold", theme === t.value ? "text-primary" : "text-foreground")}>
                                                {t.name}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-wider font-bold opacity-40">{t.desc}</span>
                                        </div>
                                        {theme === t.value && (
                                            <motion.div layoutId="active-theme" className="absolute right-4">
                                                <CheckCircle2 className="size-5 text-primary" />
                                            </motion.div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </GlassCard>
                    </div>

                    {/* Wallpaper Showroom */}
                    <GlassCard delay={0.3}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3 text-primary">
                                <Sparkles className="size-5" />
                                <h3 className="text-sm font-bold uppercase tracking-widest opacity-80">Chat Wallpaper</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-4">
                            {WALLPAPER_COLORS.map((color) => (
                                <motion.button
                                    key={color.name}
                                    whileHover={{ scale: 1.1, y: -5 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSaveField("wallpaper", color.value)}
                                    className={cn(
                                        "aspect-[3/4] rounded-2xl border-4 transition-all duration-300 relative group overflow-hidden",
                                        user?.wallpaper === color.value
                                            ? "border-primary shadow-[0_0_30px_rgba(var(--primary),0.4)]"
                                            : "border-white/5 shadow-xl hover:border-white/20"
                                    )}
                                >
                                    <div className={cn("absolute inset-0", color.class)} />
                                    {user?.wallpaper === color.value ? (
                                        <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[2px]">
                                            <CheckCircle2 className="size-6 text-white drop-shadow-lg" />
                                        </div>
                                    ) : (
                                        <div className="absolute inset-x-0 bottom-0 py-2 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[8px] text-white font-bold uppercase tracking-widest text-center block">
                                                {color.name}
                                            </span>
                                        </div>
                                    )}
                                    {color.value === null && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Palette className="size-6 text-muted-foreground/30" />
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </GlassCard>

                    {/* Footer Branding */}
                    <div className="flex flex-col items-center pt-8 pb-12 opacity-30 select-none grayscale">
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="size-4" />
                            <span className="text-sm font-bold tracking-[0.2em] uppercase">Lume UI Engine</span>
                        </div>
                        <p className="text-[10px] font-medium tracking-[0.3em] uppercase">v4.1.0-PREMIUM</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
