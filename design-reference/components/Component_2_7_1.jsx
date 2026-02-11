import Component_2_7_1_1 from './Component_2_7_1_1';

function Component_2_7_1() {
  return (
    <div
      className="flex justify-between items-center gap-y-8 gap-x-8 caret-[#f0f0f5]"
      data-component-id="Component_2_7_1"
    >
      <Component_2_7_1_1 />
      <div className="flex items-center gap-y-8 gap-x-8 caret-[#f0f0f5]">
        <a
          href="#services"
          className="text-[#8892a8] leading-[1.42857] text-[14px] block caret-[#8892a8]"
        >
          Services
        </a>
        <a
          href="#portfolio"
          className="text-[#8892a8] leading-[1.42857] text-[14px] block caret-[#8892a8]"
        >
          Portfolio
        </a>
        <a
          href="#contact"
          className="text-[#8892a8] leading-[1.42857] text-[14px] block caret-[#8892a8]"
        >
          Contact
        </a>
      </div>
    </div>
  );
}

export default Component_2_7_1;
