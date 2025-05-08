import { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './AIMoodTracker.css';

const AIMoodTracker = () => {
  // State Management
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [mood, setMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [logs, setLogs] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [textMood, setTextMood] = useState(null);
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [isAutoAnalysisActive, setIsAutoAnalysisActive] = useState(false);
  const [autoAnalysisInterval, setAutoAnalysisInterval] = useState(null);
  const [moodInsight, setMoodInsight] = useState('');
  const [wellnessRecommendations, setWellnessRecommendations] = useState([]);
  const [webcamError, setWebcamError] = useState(null);
  const [isWebcamLoading, setIsWebcamLoading] = useState(false);
  const [wellness, setWellness] = useState({
    sleep: 7,
    nutrition: 3,
    exercise: 3,
    stress: 3
  });

  // Load TensorFlow.js model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        console.log("TensorFlow.js is ready");
        const loadedModel = await facemesh.load({ maxFaces: 1 });
        console.log("Facemesh model loaded successfully");
        setModel(loadedModel);
      } catch (error) {
        console.error("Failed to load facemesh model:", error);
        alert("Failed to load facial analysis model. Some features may not work properly.");
      }
    };
    
    loadModel();
    
    return () => {
      if (autoAnalysisInterval) {
        clearInterval(autoAnalysisInterval);
      }
      if (tf && tf.disposeVariables) {
        tf.disposeVariables();
      }
    };
  }, [autoAnalysisInterval]);

  // Initialize webcam when isWebcamActive is true
  useEffect(() => {
    let stream = null;
    const videoElement = webcamRef.current; // Copy ref to local variable

    const startWebcam = async () => {
      if (!isWebcamActive || !videoElement) return;

      setIsWebcamLoading(true);
      setWebcamError(null);

      try {
        console.log("Requesting camera access...");
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user"
          },
          audio: false
        });

        console.log("Camera access granted, setting up video element");
        if (videoElement) {
          videoElement.srcObject = stream;
          videoElement.onloadedmetadata = () => {
            console.log("Video metadata loaded, playing video");
            videoElement.play().catch(err => {
              console.error("Error playing webcam video:", err);
              setWebcamError("Failed to play webcam video. Please try again.");
              setIsWebcamActive(false);
            });
            setIsWebcamLoading(false);
          };
        } else {
          throw new Error("Webcam ref is not available");
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
        setIsWebcamLoading(false);
        setIsWebcamActive(false);
        
        if (error.name === 'NotAllowedError') {
          setWebcamError("Camera access denied. Please allow camera access in your browser permissions.");
        } else if (error.name === 'NotFoundError') {
          setWebcamError("No camera found. Please connect a camera and try again.");
        } else {
          setWebcamError(`Could not access the webcam: ${error.message}`);
        }
      }
    };

    startWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [isWebcamActive]);

  // Handle webcam start
  const handleStartWebcam = () => {
    if (!webcamRef.current) {
      console.error("Webcam ref is not available before starting");
      setWebcamError("Webcam element is not ready. Please try again or refresh the page.");
      return;
    }
    setIsWebcamActive(true);
  };

  // Stop webcam
  const stopWebcam = () => {
    if (isAutoAnalysisActive) {
      stopAutoAnalysis();
    }
    setIsWebcamActive(false);
    setWebcamError(null);
    setIsWebcamLoading(false);
  };

  // Start automatic mood analysis
  const startAutoAnalysis = () => {
    if (!isWebcamActive || !model) {
      alert("Please ensure webcam is active and AI model is loaded.");
      return;
    }
    
    const interval = setInterval(async () => {
      await captureAndAnalyzeFace(false);
    }, 5000);
    
    setAutoAnalysisInterval(interval);
    setIsAutoAnalysisActive(true);
  };
  
  // Stop automatic mood analysis
  const stopAutoAnalysis = () => {
    if (autoAnalysisInterval) {
      clearInterval(autoAnalysisInterval);
      setAutoAnalysisInterval(null);
    }
    setIsAutoAnalysisActive(false);
  };

  // Capture Image
  const captureImage = () => {
    if (!webcamRef.current || !isWebcamActive) {
      alert("Please start the webcam first");
      return;
    }
    
    const canvas = canvasRef.current;
    const video = webcamRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageData);
    return imageData;
  };

  // Combine capture and analysis for auto-mode
  const captureAndAnalyzeFace = async (saveToLogs = true) => {
    if (!model || !isWebcamActive) return;
    
    try {
      const imageData = captureImage();
      if (!imageData) return null; // Early return if capture fails

      const img = new Image();
      img.src = imageData;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      const ctx = tempCanvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const predictions = await model.estimateFaces(tempCanvas);
      
      if (predictions.length > 0) {
        const face = predictions[0];
        const landmarks = face.scaledMesh;
        
        const leftMouthCorner = landmarks[61];
        const rightMouthCorner = landmarks[291];
        const upperLipCenter = landmarks[13];
        const lowerLipCenter = landmarks[14];
        const mouthOpenness = Math.abs(upperLipCenter[1] - lowerLipCenter[1]);
        
        const mouthMiddleY = (upperLipCenter[1] + lowerLipCenter[1]) / 2;
        const mouthCurvature = mouthMiddleY - (leftMouthCorner[1] + rightMouthCorner[1]) / 2;
        
        const leftEyeTop = landmarks[159];
        const leftEyeBottom = landmarks[145];
        const rightEyeTop = landmarks[386];
        const rightEyeBottom = landmarks[374];
        
        const eyeOpenness = (
          Math.abs(leftEyeTop[1] - leftEyeBottom[1]) +
          Math.abs(rightEyeTop[1] - rightEyeBottom[1])
        ) / 2;
        
        const leftEyebrow = landmarks[66];
        const rightEyebrow = landmarks[296];
        const leftEyebrowToEye = Math.abs(leftEyebrow[1] - leftEyeTop[1]);
        const rightEyebrowToEye = Math.abs(rightEyebrow[1] - rightEyeTop[1]);
        const eyebrowEyeDistance = (leftEyebrowToEye + rightEyebrowToEye) / 2;
        
        let detectedMood;
        let confidence = 0;
        
        const happinessScore = mouthCurvature * 4 + mouthOpenness * 0.5 + eyeOpenness * 0.5;
        const sadnessScore = -mouthCurvature * 3 + (5 - eyebrowEyeDistance) * 0.8 + (5 - eyeOpenness) * 0.5;
        const neutralScore = 5 - Math.abs(mouthCurvature) * 0.6;
        
        console.log("Mood scores:", { happinessScore, sadnessScore, neutralScore });
        
        if (happinessScore > sadnessScore && happinessScore > neutralScore) {
          detectedMood = 'happy';
          confidence = Math.min(100, Math.round(happinessScore * 10));
        } else if (sadnessScore > happinessScore && sadnessScore > neutralScore) {
          detectedMood = 'sad';
          confidence = Math.min(100, Math.round(sadnessScore * 10));
        } else {
          detectedMood = 'neutral';
          confidence = Math.min(100, Math.round(neutralScore * 15));
        }
        
        console.log(`Detected mood: ${detectedMood} with ${confidence}% confidence`);
        setMood(detectedMood);
        
        setMoodHistory(prev => {
          const newHistory = [...prev, {
            mood: detectedMood,
            timestamp: new Date(),
            confidence
          }];
          return newHistory.slice(-20);
        });
        
        generateMoodInsights(detectedMood);
        generateWellnessRecommendations(detectedMood, wellness);
        
        if (saveToLogs) {
          const newLog = {
            date: new Date().toLocaleString(),
            type: 'facial',
            mood: detectedMood,
            confidence: confidence,
            image: imageData
          };
          
          setLogs(prevLogs => [...prevLogs, newLog]);
        }
        
        return detectedMood;
      }
    } catch (error) {
      console.error("Error in auto face analysis:", error);
      if (saveToLogs) {
        alert("Error analyzing face. Please try again with better lighting and face clearly visible.");
      }
    }
    
    return null;
  };

  // Enhanced mood detection with psychology-based insights
  const generateMoodInsights = (mood) => {
    const insights = {
      happy: [
        "Your positive expression indicates good emotional well-being.",
        "Happiness triggers endorphins that boost your overall health.",
        "Maintaining this positive state can strengthen your immune system and reduce stress.",
        "Your positive mood can have a beneficial effect on those around you."
      ],
      sad: [
        "It's natural to experience moments of sadness - it's part of being human.",
        "Sadness can signal a need for reflection or care for yourself.",
        "Your brain processes emotions to help you respond appropriately to situations.",
        "Acknowledging sadness is an important step in emotional health."
      ],
      neutral: [
        "A neutral expression can indicate calm or contemplative states.",
        "This balanced emotional state is good for focused activities.",
        "Neutrality can represent emotional stability and composure.",
        "This state allows you to respond thoughtfully rather than reactively."
      ]
    };

    const randomIndex = Math.floor(Math.random() * insights[mood].length);
    setMoodInsight(insights[mood][randomIndex]);
  };

  // Enhanced wellness recommendations
  const generateWellnessRecommendations = (mood, wellnessMetrics) => {
    let recommendations = [];
    
    const moodRecommendations = {
      happy: [
        "Journal about the positive aspects of your day to reinforce these feelings.",
        "Share your joy with someone else to amplify the positive effects.",
        "Use this positive energy for creative activities or planning.",
        "Practice gratitude meditation to maintain this positive state."
      ],
      sad: [
        "Try a 5-minute breathing exercise: inhale for 4 counts, hold for 7, exhale for 8.",
        "Reach out to a friend or family member for support.",
        "Take a gentle walk outside - nature and light movement can help shift your mood.",
        "Practice self-compassion - speak to yourself with the kindness you'd offer a friend.",
        "Consider the RAIN method: Recognize, Allow, Investigate, and Nurture your feelings."
      ],
      neutral: [
        "Use mindfulness to check in with how you're truly feeling beneath the surface.",
        "Try a brief body scan meditation to connect with yourself.",
        "Set an intention for how you'd like to feel for the rest of the day.",
        "Consider what activities might bring you joy or fulfillment right now."
      ]
    };
    
    const moodRecs = moodRecommendations[mood];
    recommendations.push(moodRecs[Math.floor(Math.random() * moodRecs.length)]);
    
    let remainingRecs = [...moodRecs];
    remainingRecs.splice(remainingRecs.indexOf(recommendations[0]), 1);
    recommendations.push(remainingRecs[Math.floor(Math.random() * remainingRecs.length)]);
    
    if (wellnessMetrics.sleep < 6) {
      recommendations.push("Your sleep appears below optimal levels. Try setting a consistent bedtime routine and limiting screen time before bed.");
    }
    
    if (wellnessMetrics.exercise < 3) {
      recommendations.push("Consider incorporating more movement into your day - even 10 minutes of walking or gentle stretching can improve mood.");
    }
    
    if (wellnessMetrics.stress > 3) {
      recommendations.push("Your stress levels appear elevated. Try progressive muscle relaxation: tense and then release each muscle group from toes to head.");
    }
    
    setWellnessRecommendations(recommendations);
  };

  // Manual Mood Selection
  const selectMood = (selectedMood) => {
    if (!['happy', 'sad', 'neutral'].includes(selectedMood)) {
      console.error("Invalid mood selected:", selectedMood);
      return;
    }
    setMood(selectedMood);
    generateMoodInsights(selectedMood);
    generateWellnessRecommendations(selectedMood, wellness);
    
    const newLog = {
      date: new Date().toLocaleString(),
      type: 'manual',
      mood: selectedMood,
      image: capturedImage || null
    };
    
    setLogs(prevLogs => [...prevLogs, newLog]);
  };

  // Text Analysis
  const analyzeText = () => {
    if (!userInput.trim()) {
      alert("Please enter some text first");
      return;
    }
    
    const positiveWords = [
      'happy', 'good', 'great', 'excellent', 'joy', 'wonderful', 'pleased', 'delighted', 'content',
      'fantastic', 'thrilled', 'grateful', 'blessed', 'optimistic', 'peaceful', 'loving', 'hopeful',
      'excited', 'cheerful', 'satisfied', 'proud', 'amused', 'inspired', 'relaxed', 'glad'
    ];
    
    const negativeWords = [
      'sad', 'bad', 'awful', 'terrible', 'unhappy', 'angry', 'upset', 'depressed', 'frustrated',
      'disappointed', 'stressed', 'anxious', 'worried', 'hopeless', 'miserable', 'exhausted',
      'lonely', 'hurt', 'afraid', 'overwhelmed', 'irritated', 'annoyed', 'tired', 'resentful'
    ];
    
    const words = userInput.toLowerCase().split(/\W+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    let sentiment;
    if (positiveCount > negativeCount) {
      sentiment = 'positive';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }
    
    setTextMood(sentiment);
    
    const moodMap = {
      'positive': 'happy',
      'negative': 'sad',
      'neutral': 'neutral'
    };
    
    generateMoodInsights(moodMap[sentiment]);
    generateWellnessRecommendations(moodMap[sentiment], wellness);
    
    const newLog = {
      date: new Date().toLocaleString(),
      type: 'text',
      content: userInput,
      mood: sentiment
    };
    
    setLogs(prevLogs => [...prevLogs, newLog]);
  };

  // Wellness Tracking
  const handleWellnessChange = (e) => {
    const newWellness = {
      ...wellness,
      [e.target.name]: parseInt(e.target.value)
    };
    
    setWellness(newWellness);
    
    if (mood) {
      generateWellnessRecommendations(mood, newWellness);
    }
  };

  // PDF Report Generation
  const generateReport = () => {
    try {
      const doc = new jsPDF();
      autoTable(doc);

      // Validate logs
      console.log("Logs before PDF generation:", logs);
      if (!logs || !Array.isArray(logs)) {
        alert("No mood data available. Please record at least one mood entry.");
        return;
      }

      doc.setFontSize(22);
      doc.setTextColor(31, 97, 141);
      doc.text("Your Wellness & Mood Report", 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
      
      doc.setFontSize(18);
      doc.setTextColor(41, 128, 185);
      doc.text("Your Wellness Metrics", 20, 50);
      
      doc.setFontSize(12);
      doc.setTextColor(66, 66, 66);
      
      doc.text("Sleep:", 30, 60);
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(52, 152, 219);
      doc.rect(70, 56, 100, 6, 'S');
      doc.rect(70, 56, (wellness.sleep/12) * 100, 6, 'F');
      doc.text(`${wellness.sleep} hours`, 175, 60);
      
      doc.text("Nutrition:", 30, 70);
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(46, 204, 113);
      doc.rect(70, 66, 100, 6, 'S');
      doc.rect(70, 66, (wellness.nutrition/5) * 100, 6, 'F');
      doc.text(`${wellness.nutrition}/5`, 175, 70);
      
      doc.text("Exercise:", 30, 80);
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(155, 89, 182);
      doc.rect(70, 76, 100, 6, 'S');
      doc.rect(70, 76, (wellness.exercise/5) * 100, 6, 'F');
      doc.text(`${wellness.exercise}/5`, 175, 80);
      
      doc.text("Stress Level:", 30, 90);
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(231, 76, 60);
      doc.rect(70, 86, 100, 6, 'S');
      doc.rect(70, 86, (wellness.stress/5) * 100, 6, 'F');
      doc.text(`${wellness.stress}/5`, 175, 90);
      
      doc.setFontSize(18);
      doc.setTextColor(41, 128, 185);
      doc.text("Your Mood History", 20, 110);
      
      const tableData = logs
        .filter(log => {
          const isValid = log &&
            typeof log.date === 'string' && log.date.trim() &&
            typeof log.type === 'string' && ['facial', 'manual', 'text'].includes(log.type) &&
            typeof log.mood === 'string' && log.mood.trim();
          if (!isValid) {
            console.warn("Filtered out invalid log entry:", log);
          }
          return isValid;
        })
        .map(log => [
          log.date,
          log.type === 'text' ? 'Text Analysis' : log.type === 'facial' ? 'Facial Analysis' : 'Manual Entry',
          log.mood.charAt(0).toUpperCase() + log.mood.slice(1)
        ]);

      console.log("Table data for PDF:", tableData);

      if (typeof doc.autoTable !== 'function') {
        console.error("autoTable is not available on jsPDF instance");
        throw new Error("PDF table generation is not supported. Please ensure jspdf-autotable is correctly installed.");
      }

      let y = 130; // Default y position
      if (tableData.length > 0) {
        doc.autoTable({
          startY: 120,
          head: [['Date', 'Analysis Type', 'Detected Mood']],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255
          },
          styles: {
            cellPadding: 5,
            fontSize: 10
          },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 50 },
            2: { cellWidth: 40 }
          }
        });
        y = doc.previousAutoTable.finalY + 20;
      } else {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("No valid mood data has been recorded yet.", 30, 120);
      }
      
      const pageHeight = doc.internal.pageSize.height;
      if (y > pageHeight - 60) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(18);
      doc.setTextColor(41, 128, 185);
      doc.text("Insights for Pregnant Mothers", 20, y);
      
      y += 10;
      doc.setFontSize(12);
      doc.setTextColor(66, 66, 66);
      
      let happyCount = logs.filter(log => log.mood === 'happy' || log.mood === 'positive').length;
      let sadCount = logs.filter(log => log.mood === 'sad' || log.mood === 'negative').length;
      let neutralCount = logs.filter(log => log.mood === 'neutral').length;
      
      let dominantMood = "neutral";
      if (happyCount > sadCount && happyCount > neutralCount) dominantMood = "positive";
      if (sadCount > happyCount && sadCount > neutralCount) dominantMood = "negative";
      
      const total = Math.max(1, happyCount + sadCount + neutralCount);
      const happyPercentage = Math.round((happyCount / total) * 100);
      const sadPercentage = Math.round((sadCount / total) * 100);
      const neutralPercentage = Math.round((neutralCount / total) * 100);
      
      doc.text(`Dominant Mood: ${dominantMood.charAt(0).toUpperCase() + dominantMood.slice(1)}`, 30, y += 10);
      doc.text(`Mood Distribution: ${happyPercentage}% Positive, ${sadPercentage}% Negative, ${neutralPercentage}% Neutral`, 30, y += 10);
      
      if (logs.length >= 3) {
        const firstThird = logs.slice(0, Math.floor(logs.length/3));
        const lastThird = logs.slice(-Math.floor(logs.length/3));
        
        const firstPositiveCount = firstThird.filter(log => log.mood === 'happy' || log.mood === 'positive').length;
        const lastPositiveCount = lastThird.filter(log => log.mood === 'happy' || log.mood === 'positive').length;
        
        const firstPositiveRatio = firstPositiveCount / firstThird.length;
        const lastPositiveRatio = lastPositiveCount / lastThird.length;
        
        let trendMessage = "Your mood appears stable over time.";
        if (lastPositiveRatio - firstPositiveRatio > 0.2) {
          trendMessage = "Your mood is trending more positive over time. Great progress!";
        } else if (firstPositiveRatio - lastPositiveRatio > 0.2) {
          trendMessage = "Your mood appears to be trending more negative recently.";
        }
        
        doc.text(`Trend Analysis: ${trendMessage}`, 30, y += 10);
      }
      
      y += 10;
      doc.text("Personalized Recommendations:", 30, y);
      
      let recommendations = [
        "Practice gentle prenatal yoga or stretching to reduce stress and improve mood.",
        "Ensure 7-8 hours of sleep nightly to support emotional health during pregnancy.",
        "Connect with other expectant mothers for emotional support and shared experiences.",
        "Journal your feelings daily to process emotions and track your well-being."
      ];
      
      recommendations.forEach(suggestion => {
        if (y > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
        y += 10;
        doc.text(`• ${suggestion}`, 35, y);
      });
      
      y += 15;
      if (y > pageHeight - 30) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(41, 128, 185);
      doc.text("Specific Wellness Actions", 20, y);
      
      y += 10;
      doc.setFontSize(12);
      doc.setTextColor(66, 66, 66);
      
      const wellnessActions = {
        sleep: {
          low: "Try going to bed 15 minutes earlier each night until you reach 7-8 hours of sleep.",
          high: "Your sleep duration looks good. Focus on sleep quality by creating a calm bedtime routine."
        },
        nutrition: {
          low: "Consider adding one more serving of fruits or vegetables to your daily meals.",
          high: "You're rating your nutrition well! Continue your balanced eating habits."
        },
        exercise: {
          low: "Start with just 5 minutes of movement daily, gradually increasing as it becomes easier.",
          high: "You're staying active! Try adding variety to your exercise routine to keep it engaging."
        },
        stress: {
          high: "High stress levels detected. Try the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8.",
          low: "Your stress levels appear manageable. Continue your effective coping strategies."
        }
      };
      
      if (wellness.sleep < 6) {
        doc.text(`• Sleep: ${wellnessActions.sleep.low}`, 30, y += 10);
      } else {
        doc.text(`• Sleep: ${wellnessActions.sleep.high}`, 30, y += 10);
      }
      
      if (wellness.nutrition < 3) {
        doc.text(`• Nutrition: ${wellnessActions.nutrition.low}`, 30, y += 10);
      } else {
        doc.text(`• Nutrition: ${wellnessActions.nutrition.high}`, 30, y += 10);
      }
      
      if (wellness.exercise < 3) {
        doc.text(`• Exercise: ${wellnessActions.exercise.low}`, 30, y += 10);
      } else {
        doc.text(`• Exercise: ${wellnessActions.exercise.high}`, 30, y += 10);
      }
      
      if (wellness.stress > 3) {
        doc.text(`• Stress: ${wellnessActions.stress.high}`, 30, y += 10);
      } else {
        doc.text(`• Stress: ${wellnessActions.stress.low}`, 30, y += 10);
      }
      
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`CareBridge Wellness Report - Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      }
      
      doc.save(`wellness-report-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error("Error generating PDF report:", error);
      let userMessage = "Failed to generate PDF report.";
      if (error.message.includes("autoTable")) {
        userMessage = "PDF table generation failed. Please ensure the application is properly configured.";
      } else if (error.message.includes("memory")) {
        userMessage = "Memory issue detected. Try generating with fewer entries or use a different browser.";
      } else if (error.message.includes("permission")) {
        userMessage = "Download blocked. Check browser permissions or disable ad blockers.";
      } else if (error.message.includes("Cannot read properties of undefined (reading 'startY')")) {
        userMessage = "No valid mood data to generate report. Please record a mood entry (facial, manual, or text) and try again.";
      }
      alert(`${userMessage} Please try again or contact support.`);
    }
  };

  // JSX
  return (
    <div className="ai-mood-tracker">
      <header>
        <h1>AI Mood Tracker</h1>
        <p className="tagline">Intelligent wellness analysis and recommendations for mothers</p>
      </header>

      <section className="tracker-section">
        <h2>Facial Mood Analysis</h2>
        <div className="webcam-container" style={{ minHeight: '360px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="webcam-wrapper">
            <video
              ref={webcamRef}
              autoPlay
              playsInline
              muted
              className="webcam-video"
              style={{
                width: '640px',
                height: '480px',
                objectFit: 'cover',
                border: '2px solid #ccc',
                borderRadius: '8px',
                display: isWebcamActive ? 'block' : 'none'
              }}
            />
            {!isWebcamActive && !isWebcamLoading && (
              <div className="webcam-placeholder" style={{ textAlign: 'center' }}>
                <p>Enable your camera to analyze your facial expressions in real time</p>
                <button onClick={handleStartWebcam} className="action-btn primary-btn">
                  <span className="icon camera"></span> Start Webcam
                </button>
                {webcamError && <p style={{ color: 'red', marginTop: '10px' }}>{webcamError}</p>}
              </div>
            )}
            {isWebcamLoading && (
              <div style={{ textAlign: 'center' }}>
                <p>Loading webcam...</p>
              </div>
            )}
            {isWebcamActive && !isWebcamLoading && (
              <div className="webcam-controls" style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'center' }}>
                {!isAutoAnalysisActive ? (
                  <button onClick={startAutoAnalysis} className="action-btn start-auto-btn">
                    <span className="icon auto"></span> Start Auto Analysis
                  </button>
                ) : (
                  <button onClick={stopAutoAnalysis} className="action-btn stop-auto-btn">
                    <span className="icon stop"></span> Stop Auto Analysis
                  </button>
                )}
                <button onClick={() => captureAndAnalyzeFace(true)} className="action-btn capture-btn">
                  <span className="icon camera"></span> Capture & Analyze
                </button>
                <button onClick={stopWebcam} className="action-btn stop-btn">
                  <span className="icon stop"></span> Stop Webcam
                </button>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        
        {capturedImage && (
          <div className="analysis-panel" style={{ marginTop: '20px', textAlign: 'center' }}>
            <img src={capturedImage} alt="Captured" className="preview-image" style={{ maxWidth: '320px', borderRadius: '8px' }} />
            <div className="manual-mood-selection" style={{ marginTop: '10px' }}>
              <p>Or select your mood manually:</p>
              <div className="mood-buttons" style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => selectMood('happy')} className="mood-btn happy">
                  <span className="mood-emoji">😊</span> Happy
                </button>
                <button onClick={() => selectMood('neutral')} className="mood-btn neutral">
                  <span className="mood-emoji">😐</span> Neutral
                </button>
                <button onClick={() => selectMood('sad')} className="mood-btn sad">
                  <span className="mood-emoji">😔</span> Sad
                </button>
              </div>
            </div>
          </div>
        )}
        
        {mood && (
          <div className={`mood-result ${mood}`} style={{ marginTop: '20px', textAlign: 'center' }}>
            <span className="mood-emoji">
              {mood === 'happy' ? '😊' : mood === 'sad' ? '😔' : '😐'}
            </span>
            <span>Detected Mood: {mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
            {logs.length > 0 && logs[logs.length-1].confidence && (
              <span className="confidence-indicator">
                Confidence: {logs[logs.length-1].confidence}%
              </span>
            )}
          </div>
        )}
        
        {mood && moodInsight && (
          <div className="mood-insight" style={{ marginTop: '20px' }}>
            <h3>Mood Insight:</h3>
            <p>{moodInsight}</p>
          </div>
        )}
        
        {wellnessRecommendations.length > 0 && (
          <div className="wellness-recommendations" style={{ marginTop: '20px' }}>
            <h3>Personalized Recommendations:</h3>
            <ul>
              {wellnessRecommendations.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="tracker-section">
        <h2>Text Mood Analysis</h2>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Describe how you're feeling today..."
          rows={4}
          className="text-input"
          style={{ width: '100%', padding: '10px', borderRadius: '8px' }}
        />
        <button onClick={analyzeText} className="action-btn analyze-btn" style={{ marginTop: '10px' }}>
          <span className="icon analyze"></span> Analyze Text
        </button>
        
        {textMood && (
          <div className={`text-result ${textMood}`} style={{ marginTop: '20px', textAlign: 'center' }}>
            <span className="mood-emoji">
              {textMood === 'positive' ? '😊' : textMood === 'negative' ? '😔' : '😐'}
            </span>
            <span>Text Mood: {textMood.charAt(0).toUpperCase() + textMood.slice(1)}</span>
          </div>
        )}
      </section>

      <section className="tracker-section">
        <h2>Well-Being Tracker</h2>
        <div className="wellness-metrics">
          <div className="metric">
            <label>Sleep (hours): {wellness.sleep}</label>
            <input
              type="range"
              min="0"
              max="12"
              name="sleep"
              value={wellness.sleep}
              onChange={handleWellnessChange}
              className="aislider"
            />
            <span className="metric-info">7-8 hours is recommended for adults</span>
          </div>
          
          <div className="metric">
            <label>Nutrition: {Array(wellness.nutrition).fill('⭐').join('')}</label>
            <input
              type="range"
              min="1"
              max="5"
              name="nutrition"
              value={wellness.nutrition}
              onChange={handleWellnessChange}
              className="aislider"
            />
            <span className="metric-info">How balanced are your meals?</span>
          </div>
          
          <div className="metric">
            <label>Exercise: {Array(wellness.exercise).fill('⭐').join('')}</label>
            <input
              type="range"
              min="1"
              max="5"
              name="exercise"
              value={wellness.exercise}
              onChange={handleWellnessChange}
              className="aislider"
            />
            <span className="metric-info">Even light activity counts!</span>
          </div>
          
          <div className="metric">
            <label>Stress Level: {Array(wellness.stress).fill('📈').join('')}</label>
            <input
              type="range"
              min="1"
              max="5"
              name="stress"
              value={wellness.stress}
              onChange={handleWellnessChange}
              className="aislider"
            />
            <span className="metric-info">How stressed do you feel today?</span>
          </div>
        </div>
      </section>

      {moodHistory.length > 0 && (
        <section className="tracker-section">
          <h2>Your Mood Patterns</h2>
          <div className="mood-history-visualization">
            <div className="mood-timeline">
              {moodHistory.map((entry, index) => (
                <div 
                  key={index}
                  className={`mood-point ${entry.mood}`}
                  title={`${entry.mood} (${entry.confidence || 'N/A'}% confidence) at ${entry.timestamp.toLocaleTimeString()}`}
                  style={{height: `${Math.max(20, entry.confidence || 50)}%`}}
                />
              ))}
            </div>
            <div className="timeline-labels">
              <span>Earlier</span>
              <span>Recent</span>
            </div>
          </div>
        </section>
      )}

      <section className="tracker-section">
        <h2>Reports & Analysis</h2>
        <button onClick={generateReport} className="action-btn download-btn">
          <span className="icon download"></span> Download Comprehensive Report
        </button>
      </section>
    </div>
  );
};

export default AIMoodTracker;