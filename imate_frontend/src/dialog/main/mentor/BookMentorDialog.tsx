import React, { useState, useMemo, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface TimeSlot {
  time: string; // e.g. "07:00"
  available: boolean;
}

interface DaySlots {
  date: Date;
  morning: TimeSlot[];
  afternoon: TimeSlot[];
  evening: TimeSlot[];
}

interface BookMentorDialogProps {
  open: boolean;
  onClose: () => void;
  mentorName?: string;
  mentorId?: number;
  pricePerSession?: number;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const DAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTH_LABELS = [
  "TH1", "TH2", "TH3", "TH4", "TH5", "TH6",
  "TH7", "TH8", "TH9", "TH10", "TH11", "TH12",
];

/** Minimum hours in advance a slot can be booked */
const MIN_BOOKING_ADVANCE_HOURS = 6;

/** Maximum days into the future that can be booked */
const MAX_FUTURE_DAYS = 14;

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates(start: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Check if a date is in the past (before today) */
function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

/** Check if a date is too far in the future (> MAX_FUTURE_DAYS) */
function isFutureDate(date: Date): boolean {
  const limit = new Date();
  limit.setDate(limit.getDate() + MAX_FUTURE_DAYS);
  limit.setHours(23, 59, 59, 999);
  return date > limit;
}

/** Check if a slot time has already passed for a given date */
function isSlotPassed(time: string, date: Date): boolean {
  const now = new Date();
  const [hours, minutes] = time.split(":").map(Number);
  const slotDateTime = new Date(date);
  slotDateTime.setHours(hours, minutes, 0, 0);
  return slotDateTime < now;
}

/** Check if a slot is too close to the current time (< MIN_BOOKING_ADVANCE_HOURS) */
function isSlotTooSoon(time: string, date: Date): boolean {
  const now = new Date();
  const minTime = new Date(now.getTime() + MIN_BOOKING_ADVANCE_HOURS * 60 * 60 * 1000);
  const [hours, minutes] = time.split(":").map(Number);
  const slotDateTime = new Date(date);
  slotDateTime.setHours(hours, minutes, 0, 0);
  return slotDateTime < minTime;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────────

/** Simulates already-booked slots (would come from API in production) */
const MOCK_BOOKED_SLOTS: { date: string; time: string }[] = [
  // Example: Oct 2, 2026 at 09:00 is already booked
  { date: "2026-10-02", time: "09:00" },
  { date: "2026-10-02", time: "14:00" },
];

function isSlotBooked(time: string, date: Date): boolean {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return MOCK_BOOKED_SLOTS.some((s) => s.date === dateStr && s.time === time);
}

function generateMockSlots(weekStart: Date): DaySlots[] {
  const dates = getWeekDates(weekStart);
  return dates.map((date) => {
    const makeSlot = (time: string): TimeSlot => ({
      time,
      available: !isSlotBooked(time, date),
    });

    return {
      date,
      morning: ["07:00", "08:00", "09:00", "10:00", "11:00"].map(makeSlot),
      afternoon: ["13:00", "14:00", "15:00", "16:00"].map(makeSlot),
      evening: ["17:00"].map(makeSlot),
    };
  });
}

// ─── Component ──────────────────────────────────────────────────────────────────

const BookMentorDialog: React.FC<BookMentorDialogProps> = ({
  open,
  onClose,
  mentorName,
  mentorId,
  pricePerSession,
}) => {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(new Date()));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const availableSlots = useMemo(() => generateMockSlots(weekStart), [weekStart]);

  const currentDaySlots: DaySlots | undefined = availableSlots.find((ds) =>
    isSameDay(ds.date, selectedDate)
  );

  // ── Slot status helpers ─────────────────────────────────────────────────────
  const getSlotStatus = useCallback(
    (time: string): "available" | "booked" | "passed" | "too-soon" => {
      if (isSlotBooked(time, selectedDate)) return "booked";
      if (isSlotPassed(time, selectedDate)) return "passed";
      if (isSlotTooSoon(time, selectedDate)) return "too-soon";
      return "available";
    },
    [selectedDate]
  );

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handlePrevWeek = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    // Don't go before current week
    const currentWeekStart = getWeekStart(new Date());
    if (prev < currentWeekStart) return;
    setWeekStart(prev);
    setSelectedDate(prev);
    setSelectedTime(null);
  };

  const handleNextWeek = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    // Don't go beyond MAX_FUTURE_DAYS
    if (isFutureDate(next)) return;
    setWeekStart(next);
    setSelectedDate(next);
    setSelectedTime(null);
  };

  const handleDateSelect = (date: Date) => {
    if (isPastDate(date) || isFutureDate(date)) return;
    setSelectedDate(date);
    setSelectedTime(null);
    console.log("[BookMentor] Selected date:", date.toLocaleDateString("vi-VN"));
  };

  const handleTimeSelect = (time: string) => {
    const status = getSlotStatus(time);
    if (status !== "available") return;
    setSelectedTime(time);
    console.log("[BookMentor] Selected time:", time);
  };

  const handleConfirmBooking = () => {
    if (!selectedTime) return;
    console.log(
      "[BookMentor] Opening confirm dialog →",
      selectedDate.toLocaleDateString("vi-VN"),
      selectedTime,
      mentorName ? `with ${mentorName}` : ""
    );
    setShowConfirm(true);
  };

  const handlePaymentConfirm = async () => {
    setIsBooking(true);

    // Format date in local timezone (YYYY-MM-DD) like peppo
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const bookDateStr = `${year}-${month}-${day}`;

    console.log("[BookMentor] 🔍 Booking Validation:", {
      mentorId,
      bookDate: bookDateStr,
      selectedTime,
      selectedDayOfWeek: selectedDate.getDay(),
      pricePerSession,
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("[BookMentor] ✅ Payment confirmed! Booking:", bookDateStr, selectedTime);

    setIsBooking(false);
    setShowConfirm(false);
    setSelectedTime(null);
    onClose();
  };

  // ── Render guard ────────────────────────────────────────────────────────────
  if (!open) return null;

  // ── Week header label ─────────────────────────────────────────────────────
  const firstDay = weekDates[0];
  const lastDay = weekDates[6];
  const monthLabel =
    firstDay.getMonth() === lastDay.getMonth()
      ? MONTH_LABELS[firstDay.getMonth()]
      : `${MONTH_LABELS[firstDay.getMonth()]}–${MONTH_LABELS[lastDay.getMonth()]}`;
  const weekRangeLabel = `${monthLabel} ${firstDay.getDate()}–${lastDay.getDate()}, ${lastDay.getFullYear()}`;

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Main Modal ─────────────────────────────────────────────────── */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-[520px] bg-[#11142D] border border-[rgba(255,255,255,0.08)] rounded-t-[24px] sm:rounded-[20px] shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Drag handle (mobile feel) */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-10 h-1 rounded-full bg-white/20" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-10"
          >
            <X size={20} />
          </button>

          <div className="p-6 sm:p-8">
            {/* ──── Header ──────────────────────────────────────────── */}
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                Đặt lịch phỏng vấn với mentor
              </h2>
              <p className="text-slate-400 text-sm">
                Thảo luận về trình độ và lộ trình học tập của bạn
              </p>
            </div>

            {/* ──── Date Selector ───────────────────────────────────── */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Lịch trống
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium mr-1">
                    {weekRangeLabel}
                  </span>
                  <button
                    onClick={handlePrevWeek}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={handleNextWeek}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Day pills */}
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date) => {
                  const isSelected = isSameDay(date, selectedDate);
                  const isPast = isPastDate(date);
                  const isFuture = isFutureDate(date);
                  const isDisabled = isPast || isFuture;
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => handleDateSelect(date)}
                      disabled={isDisabled}
                      className={`flex flex-col items-center py-2 rounded-xl transition-all duration-200 ${
                        isDisabled
                          ? "opacity-30 cursor-not-allowed text-slate-600"
                          : isSelected
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                          : "bg-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="text-[10px] font-semibold uppercase mb-1">
                        {DAY_LABELS[date.getDay()]}
                      </span>
                      <span className={`text-base font-bold ${isSelected ? "text-white" : ""}`}>
                        {date.getDate()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ──── Time Slots ──────────────────────────────────────── */}
            <div className="space-y-5 mb-6">
              <SlotGroup
                icon="☀️"
                label="Buổi sáng"
                slots={currentDaySlots?.morning ?? []}
                selectedTime={selectedTime}
                onSelect={handleTimeSelect}
                getStatus={getSlotStatus}
              />
              <SlotGroup
                icon="🌤️"
                label="Buổi chiều"
                slots={currentDaySlots?.afternoon ?? []}
                selectedTime={selectedTime}
                onSelect={handleTimeSelect}
                getStatus={getSlotStatus}
              />
              <SlotGroup
                icon="🌙"
                label="Buổi tối"
                slots={currentDaySlots?.evening ?? []}
                selectedTime={selectedTime}
                onSelect={handleTimeSelect}
                getStatus={getSlotStatus}
              />
            </div>

            {/* ──── Booking limit info ──────────────────────────────── */}
            <div className="rounded-xl bg-white/5 border border-white/10 p-3 mb-5">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                ⓘ Bạn chỉ có thể đặt lịch trong vòng <b className="text-slate-300">{MAX_FUTURE_DAYS} ngày</b> tới và phải đặt trước ít nhất <b className="text-slate-300">{MIN_BOOKING_ADVANCE_HOURS} tiếng</b>.
              </p>
            </div>

            {/* ──── CTA Button ─────────────────────────────────────── */}
            <button
              onClick={handleConfirmBooking}
              disabled={!selectedTime}
              className={`w-full h-14 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                selectedTime
                  ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-500 hover:shadow-lg hover:shadow-purple-500/30 hover:scale-[1.01] active:scale-[0.99]"
                  : "bg-white/10 text-slate-500 cursor-not-allowed"
              }`}
            >
              Xác Nhận Đặt Lịch & Thanh Toán
              {selectedTime && <ArrowRight size={18} />}
            </button>

            <p className="text-center text-[10px] text-slate-500 mt-3 uppercase tracking-wide">
              Bằng cách xác nhận, bạn đồng ý với điều khoản và chính sách của IMATE
            </p>
          </div>
        </div>
      </div>

      {/* ── Payment Confirmation Sub-dialog ─────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !isBooking && setShowConfirm(false)}
          />
          <div className="relative w-full max-w-[400px] bg-[#1A1F3D] border border-white/10 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-white mb-2">
              Xác nhận thanh toán
            </h3>
            <p className="text-sm text-slate-400 mb-1">
              Bạn đang đặt lịch phỏng vấn:
            </p>
            <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">📅 Ngày:</span>
                <span className="text-white font-medium">
                  {selectedDate.toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">🕐 Giờ:</span>
                <span className="text-white font-medium">{selectedTime}</span>
              </div>
              {mentorName && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">👤 Mentor:</span>
                  <span className="text-white font-medium">{mentorName}</span>
                </div>
              )}
              {pricePerSession != null && pricePerSession > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">💰 Chi phí:</span>
                  <span className="text-indigo-400 font-medium">
                    {pricePerSession.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 mb-6">
              <p className="text-xs text-amber-300/80">
                ⚠️ Giao dịch được đảm bảo bởi IMATE. Tiền sẽ được hoàn trả nếu buổi cố vấn không diễn ra đúng cam kết.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isBooking}
                className="flex-1 h-11 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm font-semibold disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handlePaymentConfirm}
                disabled={isBooking}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:shadow-purple-500/25 text-white text-sm font-bold transition-all disabled:opacity-50"
              >
                {isBooking ? "Đang xử lý..." : "Thanh toán"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── Slot Group Sub-component ─────────────────────────────────────────────────

interface SlotGroupProps {
  icon: string;
  label: string;
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
  getStatus: (time: string) => "available" | "booked" | "passed" | "too-soon";
}

const SlotGroup: React.FC<SlotGroupProps> = ({
  icon,
  label,
  slots,
  selectedTime,
  onSelect,
  getStatus,
}) => {
  if (slots.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-sm">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          {label}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => {
          const isActive = selectedTime === slot.time;
          const status = getStatus(slot.time);
          const isDisabled = status !== "available";

          return (
            <button
              key={slot.time}
              onClick={() => onSelect(slot.time)}
              disabled={isDisabled}
              title={
                status === "booked"
                  ? "Đã được đặt"
                  : status === "passed"
                  ? "Đã quá giờ"
                  : status === "too-soon"
                  ? `Cần đặt trước ít nhất ${MIN_BOOKING_ADVANCE_HOURS} tiếng`
                  : undefined
              }
              className={`min-w-[76px] h-10 px-4 rounded-full text-sm font-medium transition-all duration-200 border ${
                isActive
                  ? "border-indigo-500 bg-indigo-500/15 text-indigo-400 shadow-sm shadow-indigo-500/20"
                  : status === "booked"
                  ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-400/60 cursor-not-allowed line-through"
                  : status === "passed"
                  ? "border-red-500/20 bg-red-500/5 text-red-400/50 cursor-not-allowed"
                  : status === "too-soon"
                  ? "border-white/5 bg-white/[0.02] text-slate-600 cursor-not-allowed"
                  : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
              }`}
            >
              {slot.time}
              {status === "booked" && (
                <span className="ml-1 text-[10px]">(Đã đặt)</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BookMentorDialog;
