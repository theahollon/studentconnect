"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, GraduationCap, AlertTriangle, Plus, X } from "lucide-react";
import { useState } from "react";

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

export default function ProfilePage() {
  const [selectedProgram, setSelectedProgram] = useState("Computer Science");
  const [allergies, setAllergies] = useState<string[]>(["Peanuts", "Gluten"]);
  const [newAllergy, setNewAllergy] = useState("");
  const [showProgramDropdown, setShowProgramDropdown] = useState(false);

  const addAllergy = () => {
    const trimmed = newAllergy.trim();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies([...allergies, trimmed]);
      setNewAllergy("");
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a) => a !== allergy));
  };

  return (
    <div className="min-h-screen bg-pink-200 py-10">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-24 h-24 rounded-full bg-white border-4 border-pink-400 flex items-center justify-center shadow-lg">
            <User className="w-12 h-12 text-pink-600" />
          </div>
          <h1 className="text-2xl font-bold text-black">My Profile</h1>
          <p className="text-gray-600">user@example.com</p>
        </div>

        {/* Study Program */}
        <Card className="shadow-md bg-white border-pink-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="w-5 h-5 text-pink-600" />
              Study Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <button
                onClick={() => setShowProgramDropdown(!showProgramDropdown)}
                className="w-full flex items-center justify-between rounded-md border border-pink-200 bg-white px-4 py-2.5 text-left text-sm text-black hover:border-pink-400 transition-colors"
              >
                <span>{selectedProgram}</span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${showProgramDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {showProgramDropdown && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-pink-200 bg-white text-black shadow-lg max-h-48 overflow-y-auto">
                  {STUDY_PROGRAMS.map((program) => (
                    <button
                      key={program}
                      onClick={() => {
                        setSelectedProgram(program);
                        setShowProgramDropdown(false);
                      }}
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
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="w-5 h-5 text-pink-600" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Current allergies */}
            <div className="flex flex-wrap gap-2">
              {allergies.length === 0 && (
                <p className="text-sm text-gray-600">No allergies added</p>
              )}
              {allergies.map((allergy) => (
                <Badge
                  key={allergy}
                  variant="secondary"
                  className="flex items-center gap-1 px-3 py-1 bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200 transition-colors"
                >
                  {allergy}
                  <button
                    onClick={() => removeAllergy(allergy)}
                    className="ml-1 hover:text-pink-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* Add allergy */}
            <div className="flex gap-2">
              <Input
                value={newAllergy}
                onChange={(e) => setNewAllergy(e.target.value)}
                placeholder="Add an allergy..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") addAllergy();
                }}
              />
              <Button
                onClick={addAllergy}
                size="sm"
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
