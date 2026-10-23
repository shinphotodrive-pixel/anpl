export interface SolutionItem {
  id: string;
  number: string;
  title: string;
  shortDesc: string;
  iconName: string;
  tag: string;
  colorScheme: {
    bg: string;
    border: string;
    iconBg: string;
    iconText: string;
    accent: string;
  };
  summary: string;
  whyItMatters: string;
  keyTechniques: {
    name: string;
    desc: string;
  }[];
  pros: string[];
  cons: string[];
  recommendedTools: string[];
  benchmarkImpact: string;
  codeSnippet: string;
}

export const SOLUTIONS_DATA: SolutionItem[] = [
  {
    id: 'synthetic-data',
    number: '01',
    title: '합성 데이터(Synthetic Data) 생성',
    shortDesc: '3D 렌더링 엔진과 생성형 AI(GAN/Diffusion)를 활용하여 실제 수집하기 어려운 극단적 희소 데이터를 무제한 생성합니다.',
    iconName: 'Bot',
    tag: 'Sim-to-Real 혁신',
    colorScheme: {
      bg: 'bg-purple-50/50',
      border: 'border-purple-200',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      accent: 'purple',
    },
    summary: '실제 도로에서 수집하기 불가능에 가까운 극한의 코너케이스(폭설/폭우, 85도 급각도, 레이저 반사, 특이 번호판)를 3D 엔진(Blender, Unreal 5, Unity Perception) 및 Diffusion 모델로 가상 생성합니다.',
    whyItMatters: '실제 차량 10만 대를 찍어도 특정 한글 용도기호("영", "외빈", "임시")나 찌그러진 번호판은 수십 장 미만으로 데이터 불균형이 극심합니다. 합성 데이터는 이를 1분 만에 수만 장 생성할 수 있습니다.',
    keyTechniques: [
      {
        name: '절차적 3D 번호판 렌더링 (Procedural 3D)',
        desc: 'Blender Python API를 통해 글꼴, 엠보싱 깊이, 태극 반사필름 텍스처, 나사 위치를 수학적으로 자동 배치하고 가상 물리 조명 적용'
      },
      {
        name: '도메인 무작위화 (Domain Randomization)',
        desc: '태양 고도, 비/눈 파티클, 차체 반사광, 카메라 렌즈 왜곡 파라미터를 무작위로 섞어 실세계 적응력(Sim-to-Real) 극대화'
      },
      {
        name: 'ControlNet & Diffusion 배경 합성',
        desc: '합성된 번호판 영역을 실사 도심/고속도로 배경 이미지와 자연스럽게 블렌딩하여 경계 이음매 부자연스러움 제거'
      }
    ],
    pros: [
      '개인정보보호법(PII) 문제 100% 원천 배제 (가상 번호/가상 차량)',
      '희소 문자/숫자/특수 규격 데이터 즉시 100,000장 확보',
      'Bounding Box 및 OCR 정답 텍스트 0초 자동 완벽 라벨링'
    ],
    cons: [
      'Sim-to-Real 도메인 갭(Domain Gap) 존재로 실사 데이터와 혼합 학습 필요',
      '렌더링 파이프라인 구축 초기 엔지니어링 비용 소요'
    ],
    recommendedTools: ['Blender 4.x Python API', 'Unity Perception SDK', 'Stable Diffusion + ControlNet', 'Omniverse Replicator'],
    benchmarkImpact: '극단적 야간/우천 인식 정확도(mAP) +24.8%p 개선 및 데이터셋 구축 비용 70% 절감',
    codeSnippet: `# Blender Python 예시: 절차적 번호판 3D 생성 스크립트
import bpy
import random

def generate_synthetic_plate(plate_number="123가 4567", tilt_angle=15):
    # 3D 텍스트 오브젝트 생성 및 엠보싱 돌출
    bpy.ops.object.text_add(location=(0, 0, 0.02))
    text_obj = bpy.context.active_object
    text_obj.data.body = plate_number
    text_obj.data.extrude = 0.005 # 엠보싱 볼록 효과
    
    # 한국형 반사필름(KOR 태극 홀로그램) 셰이더 적용
    mat = bpy.data.materials.get("KoreanReflectiveFilm")
    text_obj.data.materials.append(mat)
    
    # 가상 카메라 각도 및 조명 난수 설정
    bpy.data.objects['Camera'].rotation_euler = (random.uniform(-0.3, 0.3), 0, tilt_angle)
    bpy.ops.render.render(write_still=True)`
  },
  {
    id: 'active-learning',
    number: '02',
    title: '능동적 학습 (Active Learning)',
    shortDesc: '수백만 장의 미라벨 데이터를 전부 사람이 검수하지 않고, 모델이 가장 헷갈려하는(Low-confidence) 2~5% 데이터만 선별 라벨링합니다.',
    iconName: 'SearchCheck',
    tag: '라벨링 비용 80% 절감',
    colorScheme: {
      bg: 'bg-amber-50/50',
      border: 'border-amber-200',
      iconBg: 'bg-amber-100',
      iconText: 'text-amber-600',
      accent: 'amber',
    },
    summary: '운영 중인 주차장/톨게이트 카메라에서 쏟아지는 수백만 장의 프레임 중, 이미 99% 잘 맞추는 평범한 이미지는 버리고 모델이 오인식하거나 확신도가 낮은 고난도 프레임만 지능적으로 골라냅니다.',
    whyItMatters: '이미지 1장 라벨링 단가가 150원일 때 100만 장은 1억 5천만 원입니다. 하지만 능동적 학습을 적용하면 단 2만 장(300만 원)의 검수만으로 동일하거나 더 높은 모델 성능을 달성합니다.',
    keyTechniques: [
      {
        name: '최소 확신도 샘플링 (Least Confidence Sampling)',
        desc: '모델의 예측 확률(Softmax P)이 0.5~0.75 사이인 경계선 데이터만 자동 필터링하여 검수 큐에 등록'
      },
      {
        name: '마진 샘플링 (Margin Sampling)',
        desc: '1순위 후보(예: "가")와 2순위 후보(예: "하")의 확률 차이가 0.1 미만으로 극도로 혼동되는 문자 추출'
      },
      {
        name: '코어셋 다변화 (Core-set Diversity Selection)',
        desc: '불확실한 데이터 중에서도 중복된 차량을 걸러내고 임베딩 공간에서 가장 다양한 에지 케이스 선별'
      }
    ],
    pros: [
      '수작업 라벨링 비용 및 소요 시간 75~85% 절감',
      '모델의 약점(Weakness)만을 정밀 타격하여 빠른 성능 수렴',
      '운영 환경 지속적 배포(Continuous Learning MLOps) 구축 용이'
    ],
    cons: [
      '불확실성 추정(Softmax Calibration)이 잘못되면 아웃라이어/노이즈에 과적합 가능',
      '전문적인 MLOps 피드백 루프 파이프라인 개발 필요'
    ],
    recommendedTools: ['Label Studio Active Learning Plugin', 'Rubrix', 'ModAL', 'FiftyOne', 'DVC'],
    benchmarkImpact: '전체 데이터의 12% 라벨링만으로 전수 라벨링 대비 98.7%의 성능 도달',
    codeSnippet: `# PyTorch + Entropy 기반 능동적 학습 선별 알고리즘
import torch
import torch.nn.functional as F

def sample_uncertain_plates(model, unlabelled_loader, top_k=500):
    uncertain_pool = []
    model.eval()
    with torch.no_grad():
        for batch_imgs, frame_ids in unlabelled_loader:
            logits = model(batch_imgs) # [B, Seq_Len, Vocab_Size]
            probs = F.softmax(logits, dim=-1)
            
            # 정보 엔트로피(Entropy) 계산: 높을수록 모델이 헷갈림
            entropy = -(probs * torch.log(probs + 1e-8)).sum(dim=-1).mean(dim=1)
            for eid, ent in zip(frame_ids, entropy):
                uncertain_pool.append((eid, ent.item()))
                
    # 가장 혼란스러운 상위 K개만 인간 작업자 라벨링 큐에 전송
    uncertain_pool.sort(key=lambda x: x[1], reverse=True)
    return [x[0] for x in uncertain_pool[:top_k]]`
  },
  {
    id: 'domain-adaptation',
    number: '03',
    title: '도메인 적응 (Domain Adaptation & Transfer)',
    shortDesc: '주간 고해상도 카메라 데이터로 학습된 모델을 야간 저조도, 광각 렌즈, 신규 8자리 번호판 등 새로운 환경에 신속 적응시킵니다.',
    iconName: 'Globe',
    tag: '신규 규격/환경 즉시 대응',
    colorScheme: {
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconText: 'text-emerald-600',
      accent: 'emerald',
    },
    summary: '2019년 한국에 신규 도입된 8자리 번호판 및 홀로그램 반사필름 도입 시 기존 ALPR 장비의 인식률이 30% 급락했습니다. 도메인 적응 기술은 기존 모델 가중치를 기반으로 최소량의 타깃 도메인 데이터로 빠르게 적응합니다.',
    whyItMatters: '카메라 하드웨어가 바뀌거나 터널/지하주차장/고속도로 등 설치 장소가 바뀔 때마다 수십만 장을 다시 학습시킬 필요 없이 전이학습(Transfer Learning)과 적대적 도메인 적응(DANN)으로 1~2일 내 최적화할 수 있습니다.',
    keyTechniques: [
      {
        name: '적대적 도메인 적응 (Domain-Adversarial Neural Networks, DANN)',
        desc: '특징 추출기(Feature Extractor)가 주간/야간, 7자리/8자리를 구분하지 못하도록 도메인 판별자와 경쟁시켜 도메인 불변 특징 학습'
      },
      {
        name: '공간 변환 네트워크 (Spatial Transformer Networks, STN)',
        desc: '기울어진 각도, 렌즈 어안 왜곡을 신경망 내부에서 사전에 직사각형으로 평탄화(Rectification)하여 OCR 부담 경감'
      },
      {
        name: 'LoRA 및 Few-shot 파인튜닝',
        desc: '백본(Backbone) 가중치는 고정하고 어댑터 레이어만 미세조정하여 100장 이하의 타깃 샘플로도 신규 번호판 즉시 대응'
      }
    ],
    pros: [
      '새로운 형태 번호판(전기차 파란색, 외교 번호판) 도입 시 즉각 대응',
      '카메라 기종 변경/설치 앵글 변경 시 재학습 시간 90% 단축',
      '다양한 지역/국가 규격으로의 확장 용이'
    ],
    cons: [
      '도메인 간 갭이 너무 클 경우 음성 전이(Negative Transfer) 위험',
      '도메인 판별기 훈련 시 하이퍼파라미터 튜닝 난이도'
    ],
    recommendedTools: ['PyTorch Lightning', 'Albumentations Domain Transfer', 'MMOCR', 'PaddleOCR Framework'],
    benchmarkImpact: '신규 8자리 필름 번호판 인식 정확도 64.2% -> 97.8% 급등',
    codeSnippet: `# Domain Adversarial Training (DANN) 구조 예시
import torch.nn as nn
from torch.autograd import Function

class GradientReversalLayer(Function):
    @staticmethod
    def forward(ctx, x, alpha):
        ctx.alpha = alpha
        return x.view_as(x)
    @staticmethod
    def backward(ctx, grad_output):
        return grad_output.neg() * ctx.alpha, None

class DomainAdaptiveALPR(nn.Module):
    def __init__(self, backbone, char_classes=75):
        super().__init__()
        self.feature_extractor = backbone
        self.ocr_classifier = nn.Linear(512, char_classes)
        self.domain_discriminator = nn.Sequential(
            nn.Linear(512, 128),
            nn.ReLU(),
            nn.Linear(128, 2) # 소스 도메인(주간) vs 타깃 도메인(야간)
        )`
  },
  {
    id: 'open-data-privacy',
    number: '04',
    title: '공공 데이터 활용 & 프라이버시 거버넌스',
    shortDesc: 'AI Hub 공공 데이터를 기초 학습에 영리하게 활용하고, 개인정보보호법 및 ISO 표준을 준수하는 실시간 비식별화 파이프라인을 구축합니다.',
    iconName: 'ShieldCheck',
    tag: '법적 컴플라이언스 & 안전성',
    colorScheme: {
      bg: 'bg-blue-50/50',
      border: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      accent: 'blue',
    },
    summary: '차량 번호판 및 탑승자의 얼굴은 개인정보보호법상 민감한 고유 식별 정보입니다. 실시간 수집 시 비식별화(De-identification) 모듈을 강제하고, 한국 AI Hub의 정제된 공공 번호판 데이터를 초기 콜드스타트(Cold Start)에 활용합니다.',
    whyItMatters: '합법적인 데이터 거버넌스가 결여된 AI 모델은 서비스 중단 및 과징금(최대 수십억 원) 처분을 받습니다. 프라이버시 보호 전처리 파이프라인은 기업 상용화의 필수 전제조건입니다.',
    keyTechniques: [
      {
        name: '실시간 안면 및 보행자 마스킹 파이프라인',
        desc: '수집 스트림 즉시 YOLO-Face를 통해 운전자 얼굴 및 지나가는 행인을 가우시안 블러/픽셀화 처리'
      },
      {
        name: '가역적 비식별화 암호화 (Reversible Encryption)',
        desc: '범죄 수사 등 법적 영장 집행 시에만 복호화 키로 열 수 있도록 번호판 원본 텍스트를 SHA-256 해시 및 AES-GCM으로 분리 저장'
      },
      {
        name: 'AI Hub 공공 데이터셋 결합',
        desc: '한국지능정보사회진흥원(NIA)의 "자동차 번호판 및 차량 외관 데이터" 100만+ 건을 사전 학습(Pre-training) 베이스라인으로 활용'
      }
    ],
    pros: [
      '개인정보보호위원회 감사 및 GDPR 법적 규제 100% 통과',
      '초기 수집 비용 0원으로 수십만 장의 고품질 한국형 라벨 데이터셋 확보',
      '신뢰성 높은 엔터프라이즈 레벨 보안 아키텍처 완성'
    ],
    cons: [
      '비식별화 모델 오작동 시 번호판 글자 일부가 실수로 블러링될 위험',
      '전처리 파이프라인 추가로 인한 인제스천 지연(약 8~15ms)'
    ],
    recommendedTools: ['AI Hub (aihub.or.kr)', 'OpenCV Masking', 'InsightFace', 'Presidio Analyzer', 'Apache Kafka Privacy Filter'],
    benchmarkImpact: '데이터 파이프라인 법적 감사 리스크 0건 & 베이스라인 모델 개발 기간 6개월 -> 3주 단축',
    codeSnippet: `# 실시간 스트림 안면/보행자 비식별화 처리 파이프라인
import cv2
import numpy as np

def privacy_deidentify_frame(frame, face_detector, target_plate_box):
    # 1. 탑승자 안면 및 주변 인물 자동 탐지
    faces = face_detector.detect(frame)
    for (x, y, w, h) in faces:
        # 가우시안 블러 비가역 마스킹
        face_roi = frame[y:y+h, x:x+w]
        frame[y:y+h, x:x+w] = cv2.GaussianBlur(face_roi, (51, 51), 30)
        
    # 2. 타깃 차량 외 다른 주변 차량 번호판 가림 처리
    # (타깃 번호판 target_plate_box 영역만 보존하고 나머지는 보안 정책에 따라 마스킹)
    return frame`
  }
];
