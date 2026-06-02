import {
  loadTensorflowModel,
  type TensorflowModelDelegate,
  type TfliteModel,
} from "react-native-fast-tflite";

let embeddingModel: TfliteModel | null = null;
let embeddingLoadPromise: Promise<TfliteModel> | null = null;
let detectorModel: TfliteModel | null = null;
let detectorLoadPromise: Promise<TfliteModel> | null = null;

const EMBEDDING_MODEL = require("../../../assets/models/face_embedder.tflite");
const DETECTOR_MODEL = require("../../../assets/models/face_detector.tflite");
const DEFAULT_DELEGATES: TensorflowModelDelegate[] = ["nnapi"];

export async function loadEmbeddingModel(): Promise<TfliteModel> {
  if (embeddingModel) {
    return embeddingModel;
  }

  if (!embeddingLoadPromise) {
    embeddingLoadPromise = (async () => {
      const model = await loadTensorflowModel(EMBEDDING_MODEL, DEFAULT_DELEGATES);
      embeddingModel = model;
      return model;
    })();
  }

  return embeddingLoadPromise;
}

export async function runEmbeddingModel(
  input: Float32Array
): Promise<Float32Array> {
  const model = await loadEmbeddingModel();
  const outputs = await model.run([input.buffer]);
  const output = outputs[0];
  return new Float32Array(output);
}

export async function loadDetectorModel(): Promise<TfliteModel> {
  if (detectorModel) {
    return detectorModel;
  }

  if (!detectorLoadPromise) {
    detectorLoadPromise = (async () => {
      const model = await loadTensorflowModel(DETECTOR_MODEL, DEFAULT_DELEGATES);
      detectorModel = model;
      return model;
    })();
  }

  return detectorLoadPromise;
}

export async function runDetectorModel(
  input: Float32Array
): Promise<Float32Array[]> {
  const model = await loadDetectorModel();
  const outputs = await model.run([input.buffer]);
  return outputs.map((output) => new Float32Array(output));
}
