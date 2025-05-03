import { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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
  const [isModelLoading, setIsModelLoading] = useState(false);
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
        setIsModelLoading(true);
        // Make sure TensorFlow is ready
        await tf.ready();
        console.log("TensorFlow.js is ready");
        
        // Load the facemesh model
        const loadedModel = await facemesh.load({
          maxFaces: 1
        });
        console.log("Facemesh model loaded successfully");
        setModel(loadedModel);
      } catch (error) {
        console.error("Failed to load facemesh model:", error);
        alert("Failed to load facial analysis model. Some features may not work properly.");
      } finally {
        setIsModelLoading(false);
      }
    };
    
    loadModel();
    
    // Cleanup function to handle component unmounting
    return () => {
      // Dispose any tensors if needed
      if (tf && tf.disposeVariables) {
        tf.disposeVariables();
      }
    };
  }, []);

  // Start webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      });
      
      if (webcamRef.current) {
        webcamRef.current.srcObject = stream;
        webcamRef.current.onloadedmetadata = () => {
          webcamRef.current.play();
          setIsWebcamActive(true);
        };
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      alert("Could not access the webcam. Please make sure it's connected and permissions are granted.");
    }
  };

  // Stop webcam
  const stopWebcam = () => {
    const stream = webcamRef.current?.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      webcamRef.current.srcObject = null;
      setIsWebcamActive(false);
    }
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
  };

  // Mood Detection Functions
  const analyzeFace = async () => {
    if (!model) {
      alert("Facial analysis model isn't loaded yet. Please try again in a moment.");
      return;
    }
    
    if (!capturedImage) {
      alert("Please capture an image first");
      return;
    }
    
    try {
      const img = new Image();
      img.src = capturedImage;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const predictions = await model.estimateFaces(img);
      
      if (predictions.length > 0) {
        // Use a simplified algorithm since facemesh annotations can be complex
        const face = predictions[0];
        
        // Try to access facial features
        try {
          // These are approximations and may need adjustment
          const mouthOpenness = face.annotations && 
                              face.annotations.lipsUpperInner && 
                              face.annotations.lipsLowerInner ? 
                              Math.abs(face.annotations.lipsUpperInner[5][1] - 
                                    face.annotations.lipsLowerInner[5][1]) : 0;
                                    
          const eyebrowHeight = face.annotations && 
                              face.annotations.leftEyebrowUpper ? 
                              face.annotations.leftEyebrowUpper[3][1] : 0;
          
          // Simple mood determination algorithm
          let detectedMood;
          if (mouthOpenness > 10) {
            detectedMood = 'happy';
          } else if (eyebrowHeight < 50) {
            detectedMood = 'sad';
          } else {
            detectedMood = 'neutral';
          }
          
          setMood(detectedMood);
          
          // Save to logs
          const newLog = {
            date: new Date().toLocaleString(),
            type: 'facial',
            mood: detectedMood,
            image: capturedImage
          };
          
          setLogs(prevLogs => [...prevLogs, newLog]);
        } catch (error) {
          console.error("Error analyzing facial features:", error);
          alert("Could not analyze facial features. Please try a different image or better lighting.");
        }
      } else {
        alert("No face detected in the image. Please try again with a clearer image.");
      }
    } catch (error) {
      console.error("Error analyzing face:", error);
      alert("Error analyzing face. Please try again.");
    }
  };

  // Manual Mood Selection
  const selectMood = (selectedMood) => {
    setMood(selectedMood);
    
    // Save to logs
    const newLog = {
      date: new Date().toLocaleString(),
      type: 'manual',
      mood: selectedMood,
      image: capturedImage
    };
    
    setLogs(prevLogs => [...prevLogs, newLog]);
  };

  // Text Analysis
  const analyzeText = () => {
    if (!userInput.trim()) {
      alert("Please enter some text first");
      return;
    }
    
    // Simple sentiment analysis based on keywords
    const positiveWords = ['happy', 'good', 'great', 'excellent', 'joy', 'wonderful', 'pleased', 'delighted', 'content'];
    const negativeWords = ['sad', 'bad', 'awful', 'terrible', 'unhappy', 'angry', 'upset', 'depressed', 'frustrated'];
    
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
    
    // Add to logs
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
    setWellness({
      ...wellness,
      [e.target.name]: parseInt(e.target.value)
    });
  };

  // PDF Report Generation
  const generateReport = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.setTextColor(33, 33, 33);
      doc.text("Wellness & Mood Report", 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });
      
      // Wellness Metrics
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text("Wellness Metrics", 20, 50);
      
      doc.setFontSize(12);
      doc.setTextColor(66, 66, 66);
      doc.text(`Sleep: ${wellness.sleep} hours`, 30, 60);
      doc.text(`Nutrition Rating: ${wellness.nutrition}/5`, 30, 70);
      doc.text(`Exercise Rating: ${wellness.exercise}/5`, 30, 80);
      doc.text(`Stress Level: ${wellness.stress}/5`, 30, 90);
      
      // Mood History
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text("Mood History", 20, 110);
      
      // Create table for mood logs
      const tableData = logs.map(log => [
        log.date,
        log.type === 'text' ? 'Text Analysis' : log.type === 'facial' ? 'Facial Analysis' : 'Manual Entry',
        log.mood
      ]);
      
      if (tableData.length > 0) {
        doc.autoTable({
          startY: 120,
          head: [['Date', 'Type', 'Mood']],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: [74, 137, 220],
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
      } else {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text("No mood data has been recorded yet.", 30, 120);
      }
      
      // Add mood summary and suggestions
      let pageHeight = doc.internal.pageSize.height;
      let y = doc.previousAutoTable ? doc.previousAutoTable.finalY + 20 : 130;
      
      if (y > pageHeight - 40) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(33, 33, 33);
      doc.text("Summary & Suggestions", 20, y);
      
      y += 10;
      doc.setFontSize(12);
      doc.setTextColor(66, 66, 66);
      
      // Calculate dominant mood
      let happyCount = logs.filter(log => log.mood === 'happy' || log.mood === 'positive').length;
      let sadCount = logs.filter(log => log.mood === 'sad' || log.mood === 'negative').length;
      let neutralCount = logs.filter(log => log.mood === 'neutral').length;
      
      let dominantMood = "neutral";
      if (happyCount > sadCount && happyCount > neutralCount) dominantMood = "positive";
      if (sadCount > happyCount && sadCount > neutralCount) dominantMood = "negative";
      
      let suggestions = [];
      
      if (dominantMood === "positive") {
        suggestions = [
          "Keep up the good work! Your positive outlook benefits both you and your family.",
          "Consider journaling about what's working well to maintain this positivity.",
          "Share your positive strategies with other mothers in your community."
        ];
      } else if (dominantMood === "negative") {
        suggestions = [
          "Try to take short breaks throughout the day for self-care.",
          "Consider practicing mindfulness or meditation for 5-10 minutes daily.",
          "Reach out to friends, family or a professional if you need support."
        ];
      } else {
        suggestions = [
          "Incorporate more activities you enjoy into your daily routine.",
          "Try to get regular exercise, even if it's just a short walk.",
          "Establish a consistent sleep schedule to improve overall well-being."
        ];
      }
      
      doc.text(`Dominant Mood: ${dominantMood.charAt(0).toUpperCase() + dominantMood.slice(1)}`, 30, y += 10);
      
      y += 10;
      doc.text("Suggestions:", 30, y);
      
      suggestions.forEach(suggestion => {
        y += 10;
        doc.text(`• ${suggestion}`, 35, y);
      });
      
      // Save PDF
      doc.save(`wellness-report-${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (error) {
      console.error("Error generating PDF report:", error);
      alert("Failed to generate PDF report. Please try again.");
    }
  };

  // JSX
  return (
    <div className="ai-mood-tracker">
      {/* Header */}
      <header>
        <h1>AI Mood Tracker</h1>
        <p className="tagline">Comprehensive wellness tracking for mothers</p>
      </header>

      {/* Facial Mood Tracking */}
      <section className="tracker-section">
        <h2>Facial Mood Analysis</h2>
        <div className="webcam-container">
          {!isWebcamActive ? (
            <button onClick={startWebcam} className="action-btn primary-btn">
              <span className="icon camera"></span> Start Webcam
            </button>
          ) : (
            <>
              <video 
                ref={webcamRef} 
                autoPlay 
                playsInline 
                muted 
                className="webcam-video"
              />
              <div className="webcam-controls">
                <button onClick={captureImage} className="action-btn capture-btn">
                  <span className="icon camera"></span> Capture
                </button>
                <button onClick={stopWebcam} className="action-btn stop-btn">
                  <span className="icon stop"></span> Stop Webcam
                </button>
              </div>
            </>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
        
        {capturedImage && (
          <div className="analysis-panel">
            <img src={capturedImage} alt="Captured" className="preview-image" />
            <div className="analysis-options">
              <button 
                onClick={analyzeFace} 
                className="action-btn analyze-btn"
                disabled={isModelLoading || !model}
              >
                <span className="icon analyze"></span> 
                {isModelLoading ? "Loading Model..." : "Analyze with AI"}
              </button>
              
              <div className="manual-mood-selection">
                <p>Or select your mood manually:</p>
                <div className="mood-buttons">
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
          </div>
        )}
        
        {mood && (
          <div className={`mood-result ${mood}`}>
            <span className={`mood-emoji`}>
              {mood === 'happy' ? '😊' : mood === 'sad' ? '😔' : '😐'}
            </span>
            <span>Detected Mood: {mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
          </div>
        )}
      </section>

      {/* Text Sentiment Analysis */}
      <section className="tracker-section">
        <h2>Text Mood Analysis</h2>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Describe how you're feeling today..."
          rows={4}
          className="text-input"
        />
        <button onClick={analyzeText} className="action-btn analyze-btn">
          <span className="icon analyze"></span> Analyze Text
        </button>
        
        {textMood && (
          <div className={`text-result ${textMood}`}>
            <span className="mood-emoji">
              {textMood === 'positive' ? '😊' : textMood === 'negative' ? '😔' : '😐'}
            </span>
            <span>Text Mood: {textMood.charAt(0).toUpperCase() + textMood.slice(1)}</span>
          </div>
        )}
      </section>

      {/* Wellness Tracking */}
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
              className="slider"
            />
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
              className="slider"
            />
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
              className="slider"
            />
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
              className="slider"
            />
          </div>
        </div>
      </section>

      {/* Reports */}
      <section className="tracker-section">
        <h2>Reports & History</h2>
        <button onClick={generateReport} className="action-btn download-btn">
          <span className="icon download"></span> Download PDF Report
        </button>
        
        <div className="mood-history">
          <h3>Mood Log</h3>
          {logs.length > 0 ? (
            <ul className="log-list">
              {logs.map((log, index) => (
                <li key={index} className="log-item">
                  <span className="log-date">{log.date}</span>
                  <span className="log-type">
                    {log.type === 'text' ? 'Text' : log.type === 'facial' ? 'AI' : 'Manual'}
                  </span>
                  <span className={`log-mood ${log.mood}`}>
                    {log.mood.charAt(0).toUpperCase() + log.mood.slice(1)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-log">No mood logs yet</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default AIMoodTracker;