"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, GraduationCap, AlertTriangle, Plus, X, Loader2 } from "lucide-react";
import { useState, useTransition, useEffect, useRef } from "react";
import { updateStudyProgram, addAllergy, deleteAllergy } from "@/lib/profile-actions";
import type { user_allergies } from "@/lib/supabase/types";
import { t } from "@/lib/i18n/client";

const STUDY_PROGRAMS = [
  "Computer Science",
  "Informatics",
  "Cybersecurity",
  "Data Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Industrial Economics",
  "Physics",
  "Mathematics",
];

interface Props {
  email: string;
  studyProgram: string | null;
  allergies: user_allergies[];
}

export default function ProfileClient({ email, studyProgram, allergies: initialAllergies }: Props) {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(studyProgram);
  const [allergies, setAllergies] = useState<user_allergies[]>(initialAllergies);
  const [newAllergy, setNewAllergy] = useState("");
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProgramDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectProgram = (program: string) => {
    setSelectedProgram(program);
    setShowProgramDropdown(false);
    startTransition(() => updateStudyProgram(program));
  };

  const handleAddAllergy = async () => {
    const trimmed = newAllergy.trim();
    if (!trimmed || allergies.some((a) => a.allergy === trimmed)) return;

    const tempId = `temp-${Date.now()}`;
    setAllergies((prev) => [...prev, { id: tempId, user_id: "", allergy: trimmed }]);
    setNewAllergy("");

    const real = await addAllergy(trimmed);
    setAllergies((prev) => prev.map((a) => a.id === tempId ? real : a));
  };

  const handleRemoveAllergy = (allergyId: string) => {
    setAllergies((prev) => prev.filter((a) => a.id !== allergyId));
    startTransition(() => deleteAllergy(allergyId));
  };

  return (
    <div className="min-h-screen bg-pink-200 py-10">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-24 h-24 rounded-full bg-white border-4 border-pink-400 flex items-center justify-center shadow-lg">
            <User className="w-12 h-12 text-pink-600" />
          </div>
          <h1 className="text-2xl font-bold text-black">{t("profile.title")}</h1>
          <p className="text-black">{email}</p>
          {isPending && (
            <p className="text-sm text-pink-600 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> {t("profile.saving")}
            </p>
          )}
        </div>

        {/* Study Program */}
        <Card className="shadow-md bg-white border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-black">
              <GraduationCap className="w-5 h-5 text-pink-600" />
              {t("profile.studyProgram")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowProgramDropdown(!showProgramDropdown)}
                className="w-full flex items-center justify-between rounded-md border border-pink-200 bg-white px-4 py-2.5 text-left text-sm text-black hover:border-pink-400 transition-colors"
              >
                <span>{selectedProgram ?? t("profile.selectProgram")}</span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${showProgramDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProgramDropdown && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-pink-200 bg-white text-black shadow-lg max-h-48 overflow-y-auto">
                  {STUDY_PROGRAMS.map((program) => (
                    <button
                      key={program}
                      onClick={() => selectProgram(program)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        program === selectedProgram
                          ? "bg-pink-100 text-pink-700 font-medium"
                          : "text-black hover:bg-pink-50"
                      }`}
                    >
                      {program}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card className="shadow-md bg-white border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-black">
              <AlertTriangle className="w-5 h-5 text-pink-600" />
              {t("profile.allergies")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {allergies.length === 0 && (
                <p className="text-sm text-black">{t("profile.noAllergies")}</p>
              )}
              {allergies.map((a) => (
                <Badge
                  key={a.id}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200 transition-colors"
                >
                  {a.allergy}
                  <button
                    onClick={() => handleRemoveAllergy(a.id)}
                    className="ml-1 hover:text-pink-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder={t("profile.addAllergyPlaceholder")}
                className="flex-1 text-black border-pink-200 focus:border-pink-500 focus-visible:ring-pink-400 placeholder:text-gray-400"
                onKeyDown={(e) => { if (e.key === "Enter") handleAddAllergy(); }}
              />
              <Button
                onClick={handleAddAllergy}
                size="sm"
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                <Plus className="w-4 h-4" />
                {t("profile.addButton")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
