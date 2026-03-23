import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { processWithCouncil, CouncilProcessingResult } from "@/lib/councilProcessor";
import { councilMembers } from "@/lib/councilMembers";

// Processing stage animation component
function ProcessingDots() {
  return (
    <div className="flex items-center gap-1">
      <div className="processing-dot w-2 h-2 rounded-full bg-primary" />
      <div className="processing-dot w-2 h-2 rounded-full bg-primary" />
      <div className="processing-dot w-2 h-2 rounded-full bg-primary" />
    </div>
  );
}

// Stage indicator component
function StageIndicator({
  stage,
  currentStage,
  label,
}: {
  stage: number;
  currentStage: number;
  label: string;
}) {
  const isActive = currentStage >= stage;
  const isCurrent = currentStage === stage;

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg transition-all duration-500 ${
        isActive
          ? "bg-primary/20 border border-primary/50"
          : "bg-muted/20 border border-muted/30"
      } ${isCurrent ? "stage-activate" : ""}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {stage}
      </div>
      <span
        className={`text-sm font-medium ${
          isActive ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
      {isCurrent && <ProcessingDots />}
      {isActive && currentStage > stage && (
        <span className="text-primary text-xs mr-auto">✓ کامل</span>
      )}
    </div>
  );
}

// Member card in stage 1
function MemberPerspectiveCard({
  perspective,
  index,
}: {
  perspective: CouncilProcessingResult["stage1"][0];
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { member, aspects } = perspective;

  return (
    <div
      className={`member-card-glow border border-muted/30 rounded-lg p-3 bg-card/50 backdrop-blur-sm transition-all duration-300`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <button
        className="w-full text-right flex items-center gap-2"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-xl">{member.emoji}</span>
        <div className="flex-1 text-right">
          <div className="text-sm font-bold text-foreground">{member.nameFa}</div>
          <div className="text-xs text-muted-foreground">{member.titleFa}</div>
        </div>
        <span className="text-muted-foreground text-xs">{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-1 border-t border-muted/20 pt-3">
          <div className="text-xs text-primary mb-2">
            🎯 تمرکز: {member.question_focus}
          </div>
          {aspects.map((aspect, i) => (
            <div key={i} className="text-xs text-muted-foreground flex gap-2">
              <span className="text-primary/60 flex-shrink-0">{i + 1}.</span>
              <span>{aspect}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Structured answer card for stage 2
function StructuredAnswerCard({
  answer,
  index,
}: {
  answer: CouncilProcessingResult["stage2"][0];
  index: number;
}) {
  return (
    <div className="border border-muted/30 rounded-lg p-4 bg-card/50 stage-activate">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-bold text-foreground">{answer.title}</h4>
        <Badge variant="secondary" className="text-xs flex-shrink-0">
          {answer.agreementScore}٪ توافق
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{answer.description}</p>
      <div className="flex flex-wrap gap-1">
        {answer.supportingMembers.map((member) => (
          <span
            key={member}
            className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5"
          >
            {member}
          </span>
        ))}
      </div>
    </div>
  );
}

// Filter result card for stage 3
function FilteredAnswerCard({
  answer,
}: {
  answer: CouncilProcessingResult["stage3"][0];
}) {
  return (
    <div
      className={`border rounded-lg p-4 stage-activate ${
        answer.passesFilter
          ? "border-green-500/40 bg-green-950/20"
          : "border-red-500/30 bg-red-950/10 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4
          className={`text-sm font-bold ${
            answer.passesFilter ? "text-green-400" : "text-red-400 line-through"
          }`}
        >
          {answer.title}
        </h4>
        {answer.passesFilter ? (
          <span className="text-green-400 text-xs">✅ تأیید شد</span>
        ) : (
          <span className="text-red-400 text-xs">❌ حذف شد</span>
        )}
      </div>
      <div className="space-y-1">
        {answer.filterReasons.map((reason, i) => (
          <div key={i} className="text-xs text-muted-foreground">
            {reason}
          </div>
        ))}
      </div>
    </div>
  );
}

// Final answer component for stage 4
function FinalAnswerCard({
  result,
}: {
  result: CouncilProcessingResult;
}) {
  const { stage4 } = result;

  return (
    <div className="space-y-4 stage-activate">
      {/* Expert Programmer's directive */}
      <div className="border border-green-500/40 rounded-lg p-4 bg-green-950/20">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">💻</span>
          <h4 className="text-sm font-bold text-green-400">برنامهنویس خبره — دستور اجرایی</h4>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{stage4.executiveDirective}</p>
      </div>

      {/* Implementation steps */}
      <div className="border border-primary/30 rounded-lg p-4 bg-primary/5">
        <h4 className="text-sm font-bold text-primary mb-3">📋 مراحل پیادهسازی</h4>
        <div className="space-y-2">
          {stage4.implementationSteps.map((step, i) => (
            <div key={i} className="text-sm text-foreground/90 flex gap-2">
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Technical commands if present */}
      {stage4.technicalCommands && (
        <div className="border border-cyan-500/30 rounded-lg p-4 bg-cyan-950/10">
          <h4 className="text-sm font-bold text-cyan-400 mb-3">⌨️ دستورات ترمینال</h4>
          <pre className="text-xs text-green-400 font-mono leading-relaxed overflow-x-auto">
            {stage4.technicalCommands.join("\n")}
          </pre>
        </div>
      )}

      {/* Commander's approval */}
      <div className="border border-yellow-500/40 rounded-lg p-4 bg-yellow-950/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">👑</span>
          <h4 className="text-sm font-bold text-yellow-400">فرمانده سام آرمان — تأیید نهایی</h4>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed">{stage4.commanderApproval}</p>
        <div className="mt-2 text-xs text-muted-foreground">
          ⏱️ زمان پردازش: {stage4.processingTime}ms | 🕐 {result.timestamp.toLocaleTimeString("fa-IR")}
        </div>
      </div>
    </div>
  );
}

// Main Council Page
export default function CouncilPage() {
  const [problem, setProblem] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [result, setResult] = useState<CouncilProcessingResult | null>(null);
  const [history, setHistory] = useState<{ problem: string; result: CouncilProcessingResult }[]>([]);
  const [activeTab, setActiveTab] = useState<"stage1" | "stage2" | "stage3" | "stage4">("stage4");
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleProcess = async () => {
    if (!problem.trim() || isProcessing) return;

    setIsProcessing(true);
    setCurrentStage(0);
    setResult(null);

    // Animate through stages
    await new Promise((r) => setTimeout(r, 500));
    setCurrentStage(1);
    await new Promise((r) => setTimeout(r, 1200));
    setCurrentStage(2);
    await new Promise((r) => setTimeout(r, 900));
    setCurrentStage(3);
    await new Promise((r) => setTimeout(r, 700));
    setCurrentStage(4);

    // Process
    const processed = processWithCouncil(problem);
    setResult(processed);
    setHistory((prev) => [{ problem, result: processed }, ...prev.slice(0, 4)]);
    setIsProcessing(false);
    setActiveTab("stage4");

    // Scroll to results
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleProcess();
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🌟</div>
            <div>
              <h1 className="text-lg font-bold gradient-text">شورای نور</h1>
              <p className="text-xs text-muted-foreground">سیستم تصمیمگیری چندلایه</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {councilMembers.length} عضو
            </Badge>
            <Badge variant="outline" className="text-xs">
              فرمول ۹←۶←۳←۱
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Hero section */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-3xl font-bold gradient-text mb-2">
            شورای نور QmetaRam
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
            مسئله خود را مطرح کن. ۳۱ عضو شورا از داوینچی تا انیشتین، از رومی تا
            ایلان ماسک، با فرمول ۹←۶←۳←۱ آن را پردازش میکنند.
          </p>
        </div>

        {/* Input section */}
        <Card className="council-glow mb-6 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span>📝</span>
              مسئله خود را بنویسید
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="مثال: چطور یک استارتاپ نرمافزاری موفق راهاندازی کنم؟ یا چطور تیم خود را مدیریت کنم؟ یا بهترین معماری برای یک API چیست؟"
              className="min-h-[100px] resize-none text-sm leading-relaxed border-muted/30 bg-background/50"
              dir="rtl"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Ctrl+Enter برای ارسال
              </p>
              <Button
                onClick={handleProcess}
                disabled={!problem.trim() || isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <ProcessingDots />
                    در حال پردازش...
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    فعالسازی شورا
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Processing stages indicator */}
        {(isProcessing || result) && (
          <Card className="mb-6 border-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <span>⚙️</span>
                مراحل پردازش فرمول ۹←۶←۳←۱
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StageIndicator
                  stage={1}
                  currentStage={currentStage}
                  label="لایه ۹ سوال"
                />
                <StageIndicator
                  stage={2}
                  currentStage={currentStage}
                  label="لایه ۶ جواب"
                />
                <StageIndicator
                  stage={3}
                  currentStage={currentStage}
                  label="فیلتر ۳ معیار"
                />
                <StageIndicator
                  stage={4}
                  currentStage={currentStage}
                  label="خروجی ۱ جواب"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div ref={resultsRef} className="space-y-4">
            {/* Tab navigation */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { id: "stage4" as const, label: "🎯 جواب نهایی", badge: "۱" },
                { id: "stage3" as const, label: "🔍 فیلتر", badge: "۳" },
                { id: "stage2" as const, label: "📊 ساختاربندی", badge: "۶" },
                { id: "stage1" as const, label: "👥 دیدگاهها", badge: "۹" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs ${
                      activeTab === tab.id
                        ? "bg-primary-foreground/20"
                        : "bg-muted"
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            <Card className="border-muted/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">
                  مسئله: «{result.problem}»
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeTab === "stage1" && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">
                      هر عضو ۹ جنبه از زاویه شخصیتی خود بررسی کرده است. روی هر کارت کلیک کنید.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                      {result.stage1.map((perspective, i) => (
                        <MemberPerspectiveCard
                          key={perspective.member.id}
                          perspective={perspective}
                          index={i}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "stage2" && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">
                      ۶ پاسخ ساختاری ترکیبی با بالاترین تراکم توافق بین اعضا:
                    </p>
                    <div className="space-y-3">
                      {result.stage2.map((answer, i) => (
                        <StructuredAnswerCard key={answer.id} answer={answer} index={i} />
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "stage3" && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-4">
                      فقط پاسخهایی که همزمان ۳ شرط اقتصادی، امنیتی و اخلاقی را دارند باقی میمانند:
                    </p>
                    <div className="space-y-3">
                      {result.stage3.map((answer) => (
                        <FilteredAnswerCard key={answer.id} answer={answer} />
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "stage4" && (
                  <FinalAnswerCard result={result} />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Council members grid */}
        <Card className="mt-8 border-muted/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <span>👥</span>
              اعضای شورای نور ({councilMembers.length} عضو)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {councilMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-muted/20 hover:border-primary/30 transition-colors"
                >
                  <span className="text-lg">{member.emoji}</span>
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">{member.nameFa}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {member.question_focus.length > 20
                        ? `${member.question_focus.slice(0, 20)}...`
                        : member.question_focus}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* History */}
        {history.length > 1 && (
          <Card className="mt-4 border-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <span>📜</span>
                تاریخچه مسائل
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {history.slice(1).map((h, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setProblem(h.problem);
                      setResult(h.result);
                      setCurrentStage(4);
                      setActiveTab("stage4");
                    }}
                    className="w-full text-right p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors text-xs text-muted-foreground"
                  >
                    📌 {h.problem.length > 60 ? `${h.problem.slice(0, 60)}...` : h.problem}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
