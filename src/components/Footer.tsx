import React from 'react';
import { Car, ShieldCheck, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                <Car className="w-4 h-4" />
              </div>
              <span>ALPR Dataset Solutions Hub</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              차량 번호판 인식(ALPR / ANPR) AI 모델의 데이터셋 불균형, 고속 주행 모션 블러, 심야 저조도, 
              사각 원근 왜곡 등 실세계 한계를 극복하기 위한 오픈 지식 베이스 및 데이터 엔지니어링 가이드 허브입니다.
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>대한민국 개인정보보호법 및 ISO/IEC 27001 비식별화 가이드라인 준수</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              솔루션 바로가기
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#simulator" className="hover:text-white transition-colors">
                  증강(Augmentation) 시뮬레이터
                </a>
              </li>
              <li>
                <a href="#presets" className="hover:text-white transition-colors">
                  환경 프리셋 라이브러리 (Preset Library)
                </a>
              </li>
              <li>
                <a href="#testbench" className="hover:text-white transition-colors">
                  인식 시험 & 배치 테스트 랩
                </a>
              </li>
              <li>
                <a href="#solutions" className="hover:text-white transition-colors">
                  4대 핵심 해결 전략 (합성데이터/능동학습)
                </a>
              </li>
              <li>
                <a href="#challenges" className="hover:text-white transition-colors">
                  현장 8대 챌린지 매트릭스
                </a>
              </li>
              <li>
                <a href="#pipeline" className="hover:text-white transition-colors">
                  MLOps 엔드투엔드 파이프라인
                </a>
              </li>
              <li>
                <a href="#roi" className="hover:text-white transition-colors">
                  데이터셋 비용 절감(ROI) 계산기
                </a>
              </li>
            </ul>
          </div>

          {/* Open Datasets & References */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              참조 데이터셋 & 기술 규격
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-slate-300 font-medium">AI Hub (한국지능정보사회진흥원)</span>
                <p className="text-[10px] text-slate-500">자동차 번호판 및 차종 인식 데이터셋</p>
              </li>
              <li>
                <span className="text-slate-300 font-medium">국토교통부 번호판 규격 고시</span>
                <p className="text-[10px] text-slate-500">8자리 반사필름식 번호판 표준 규격</p>
              </li>
              <li>
                <span className="text-slate-300 font-medium">Albumentations & OpenCV</span>
                <p className="text-[10px] text-slate-500">컴퓨터 비전 실시간 파이프라인 가속</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright and Legal Notice */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-4">
          <p>© 2026 ALPR Dataset Solutions Hub. All rights reserved.</p>
          <p className="text-center sm:text-right text-slate-600">
            본 허브에서 제공되는 번호판 텍스트와 시뮬레이션 이미지는 무작위로 생성된 가상 데이터이며, 실존 차량의 소유주와 무관합니다.
          </p>
        </div>
      </div>
    </footer>
  );
};
