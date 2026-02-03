import { ReactElement } from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';

import 'swiper/css/pagination';
import 'swiper/css';

export default function SwiperComponent({
  slides,
}: {
  slides: ReactElement[];
}) {
  return (
    <Swiper
      slidesPerView={3.4}
      pagination={{
        clickable: true,
      }}
      className="mySwiper"
    >
      {slides.map((slide) => {
        return <SwiperSlide>{slide}</SwiperSlide>;
      })}
    </Swiper>
  );
}
