import sys
import json
import os
import traceback

def verify(img1_path, img2_path):
    try:
        from deepface import DeepFace
        
        if not os.path.exists(img1_path):
             return {"match": False, "error": f"Document file not found: {img1_path}"}
        if not os.path.exists(img2_path):
             return {"match": False, "error": f"Selfie file not found: {img2_path}"}

        try:
            # Compare faces using DeepFace
            # enforce_detection=True will throw an exception if no face is found
            result = DeepFace.verify(
                img1_path=img1_path, 
                img2_path=img2_path, 
                model_name="Facenet", 
                enforce_detection=True 
            )
            
            is_match = bool(result.get("verified", False))
            distance = float(result.get("distance", 1.0))
            threshold = float(result.get("threshold", 0.4))
            
            # Map distance to a score. Facenet threshold is ~0.4.
            # If distance == threshold -> score should be around 85%
            # If distance == 0 -> score is 100%
            # If distance > threshold * 2 -> score is 0%
            score = max(0, min(100, (1 - (distance / (threshold * 2))) * 100))
            
            return {
                "match": is_match,
                "score": round(score, 1),
                "distance": round(distance, 4),
                "note": "Verification powered by DeepFace"
            }
        except ValueError as ve:
            # DeepFace throws ValueError if face could not be detected
            return {"match": False, "error": "Face could not be detected in one or both images.", "details": str(ve)}
        
    except Exception as e:
        return {"match": False, "error": str(e), "traceback": traceback.format_exc()}

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: python verify_face.py <img1> <img2>"}))
        sys.exit(1)
        
    # Disable TF warnings for cleaner JSON output
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    
    res = verify(sys.argv[1], sys.argv[2])
    print(json.dumps(res))
