import { CameraFrame, FaceEmbedding, PreprocessResult } from "../../types/face";
import { loadEmbeddingModel, runEmbeddingModel } from "../../native/tflite/TFLiteBridge";

export async function extractEmbedding(
  frame: CameraFrame,
  preprocess: PreprocessResult
): Promise<FaceEmbedding> {
  const model = await loadEmbeddingModel();
  const input = createModelInput(frame, model.inputs[0]?.shape ?? []);
  const output = await runEmbeddingModel(input);

  return {
    vector: Array.from(output),
    source: preprocess.status,
  };
}

function createModelInput(frame: CameraFrame, shape: number[]): Float32Array {
  const flatSize = shape.length > 0 ? shape.reduce((a, b) => a * b, 1) : 0;
  const targetSize = flatSize > 0 ? flatSize : frame.data.length;
  const input = new Float32Array(targetSize);

  for (let i = 0; i < targetSize; i += 1) {
    const value = frame.data[i % frame.data.length];
    input[i] = value / 255;
  }

  return input;
}
