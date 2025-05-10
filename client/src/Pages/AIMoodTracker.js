import { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';
import jsPDF from 'jspdf';
import './AIMoodTracker.css';

const AIMoodTracker = () => {
  // State Management
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [mood, setMood] = useState(null);
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

  // Add generateReport function
  const generateReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Helper function to add sections with proper spacing
    const addSection = (title, content, fontSize = 12) => {
      yPos += 15;
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(title, 20, yPos);
      yPos += 10;
      doc.setFontSize(fontSize);
      doc.setFont(undefined, 'normal');
      
      if (Array.isArray(content)) {
        content.forEach(item => {
          const lines = doc.splitTextToSize(item, pageWidth - 40);
          doc.text(lines, 20, yPos);
          yPos += (lines.length * 7);
        });
      } else {
        const lines = doc.splitTextToSize(content, pageWidth - 40);
        doc.text(lines, 20, yPos);
        yPos += (lines.length * 7);
      }
    };

    // Add page header with logo/branding
    doc.setFillColor(52, 152, 219); // Blue header
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('CareBridge Wellness Report', pageWidth/2, 25, { align: 'center' });
    
    // Reset text color and position
    doc.setTextColor(0, 0, 0);
    yPos = 50;

    // Add report summary
    const currentDate = new Date().toLocaleString();
    doc.setFontSize(12);
    doc.text(`Report Generated: ${currentDate}`, 20, yPos);
    yPos += 10;

    // Current Mood Analysis with visual indicator
    if (mood) {
      addSection('Current Mood Analysis', [
        `Current Mood State: ${mood.charAt(0).toUpperCase() + mood.slice(1)}`,
        logs.length > 0 && logs[logs.length-1].confidence ? 
          `Confidence Level: ${logs[logs.length-1].confidence}%` : '',
        `Time of Analysis: ${new Date().toLocaleTimeString()}`,
        moodInsight || ''
      ]);
    }

    // Wellness Metrics with visual representation
    const wellnessData = [
      `Sleep: ${wellness.sleep} hours ${wellness.sleep < 6 ? '(Below recommended)' : '(Good)'}`,
      `Nutrition Level: ${wellness.nutrition}/5`,
      `Exercise Level: ${wellness.exercise}/5`,
      `Stress Level: ${wellness.stress}/5`
    ];
    addSection('Wellness Assessment', wellnessData);

    // Recommendations with categorization
    if (wellnessRecommendations.length > 0) {
      const formattedRecs = wellnessRecommendations.map((rec, index) => 
        `${index + 1}. ${rec}`
      );
      addSection('Personalized Wellness Recommendations', formattedRecs);
    }

    // Mood History Analysis
    if (logs.length > 0) {
      const recentLogs = logs.slice(-5);
      const moodHistory = recentLogs.map(log => 
        `${log.date} - ${log.type.charAt(0).toUpperCase() + log.type.slice(1)}: ` +
        `${log.mood.charAt(0).toUpperCase() + log.mood.slice(1)}` +
        `${log.confidence ? ` (${log.confidence}% confidence)` : ''}`
      );
      addSection('Recent Mood History (Last Entries)', moodHistory);

      // Enhanced mood distribution analysis
      // Map "positive" text mood to "happy" facial mood for consistency
      const normalizedLogs = logs.map(log => ({
        ...log,
        normalizedMood: log.mood === 'positive' ? 'happy' : 
                         log.mood === 'negative' ? 'sad' : log.mood
      }));
      
      // Count occurrences of each mood type
      const moodCounts = normalizedLogs.reduce((acc, log) => {
        const mood = log.normalizedMood;
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {});
      
      // Calculate total entries for percentage calculation
      const totalEntries = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
      
      // Format mood distribution with one decimal place percentage
      const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => {
        const percentage = ((count/totalEntries) * 100).toFixed(1);
        return `${mood.charAt(0).toUpperCase() + mood.slice(1)}: ${percentage}%`;
      });
      
      addSection('Mood Distribution Analysis', moodDistribution);
    }

    // Check if new page is needed
    if (yPos > doc.internal.pageSize.height - 40) {
      doc.addPage();
      yPos = 20;
    }

    // Add action items and goals
    const actionItems = [
      "• Keep tracking your mood regularly for better self-awareness",
      "• Follow the personalized recommendations provided",
      "• Consider consulting with healthcare professionals if needed",
      "• Maintain a consistent sleep schedule",
      "• Practice stress management techniques regularly"
    ];
    addSection('Recommended Action Items', actionItems);

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(10);
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount} | CareBridge Wellness Report | Generated on ${currentDate}`,
        pageWidth/2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    doc.save(`CareBridge-Wellness-Report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // JSX
  return (
    <div className="ai-mood-tracker">
      <header>
        <h1>Mood Tracker</h1>
        <p className="tagline">Wellness analysis and recommendations for mothers</p>
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

      <section className="tracker-section">
        <h2>Generate Report</h2>
        <button 
          onClick={generateReport} 
          className="action-btn report-btn"
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          Generate PDF Report
        </button>
      </section>
    </div>
  );
};

export default AIMoodTracker;