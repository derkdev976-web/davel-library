"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RotateCcw, Eye, EyeOff } from "lucide-react"

interface FlashCardProps {
  front: string
  back: string
  category?: string
  difficulty?: "easy" | "medium" | "hard"
  className?: string
}

export function FlashCard({ 
  front, 
  back, 
  category, 
  difficulty = "medium", 
  className = "" 
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)

  const getDifficultyColor = () => {
    switch (difficulty) {
      case "easy": return "text-green-600 dark:text-green-400"
      case "hard": return "text-red-600 dark:text-red-400"
      default: return "text-yellow-600 dark:text-yellow-400"
    }
  }

  return (
    <div className={`flashcard-background rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${className}`}>
      {/* Category and Difficulty */}
      {(category || difficulty) && (
        <div className="flex justify-between items-center mb-4">
          {category && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
              {category}
            </span>
          )}
          {difficulty && (
            <span className={`text-sm font-medium ${getDifficultyColor()}`}>
              {difficulty.toUpperCase()}
            </span>
          )}
        </div>
      )}

      {/* Card Content */}
      <Card className="flashcard-background border-0 shadow-none">
        <CardContent className="p-6 min-h-[200px] flex flex-col justify-center">
          {!isFlipped ? (
            // Front of card
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {front}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Click to reveal the answer
              </p>
              <Button
                onClick={() => setIsRevealed(true)}
                variant="outline"
                className="mb-4"
              >
                <Eye className="h-4 w-4 mr-2" />
                Reveal Answer
              </Button>
            </div>
          ) : (
            // Back of card
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Answer
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                {back}
              </p>
              <Button
                onClick={() => setIsRevealed(false)}
                variant="outline"
                className="mb-4"
              >
                <EyeOff className="h-4 w-4 mr-2" />
                Hide Answer
              </Button>
            </div>
          )}

          {/* Revealed Answer (overlay) */}
          {isRevealed && !isFlipped && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md mx-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Answer
                </h4>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {back}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setIsRevealed(false)
                      setIsFlipped(true)
                    }}
                    className="flex-1"
                  >
                    Flip Card
                  </Button>
                  <Button
                    onClick={() => setIsRevealed(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2 mt-4">
        <Button
          onClick={() => setIsFlipped(!isFlipped)}
          variant="outline"
          size="sm"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {isFlipped ? "Show Front" : "Flip Card"}
        </Button>
      </div>
    </div>
  )
}
