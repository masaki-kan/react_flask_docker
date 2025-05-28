import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Image } from "@chakra-ui/react";
import "./styles.css";

import { Keyboard, Pagination, Navigation } from "swiper/modules";
import { FC } from "react";

type KeyboardControlGallerySliderProps = {
  images: string[];
  sm?: boolean;
};

const KeyboardControlGallerySlider: FC<KeyboardControlGallerySliderProps> = ({
  images,
  sm = false,
}) => {
  return (
    <>
      <Swiper
        slidesPerView={1}
        spaceBetween={30}
        keyboard={{
          enabled: true,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Keyboard, Pagination, Navigation]}
        className="mySwiper"
        loop={true}
      >
        {images.map((img, index) => {
          return (
            <SwiperSlide>
              <Image
                key={index}
                src={img}
                objectFit={"contain"}
                h={sm ? "200px!important" : "350px"}
              />
            </SwiperSlide>
          );
        })}
      </Swiper>
    </>
  );
};
export default KeyboardControlGallerySlider;
