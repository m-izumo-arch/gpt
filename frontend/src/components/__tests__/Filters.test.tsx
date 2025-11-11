import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Filters from "../../components/Filters";
import { Doctor } from "../../types";
import { vi } from "vitest";

describe("Filters", () => {
  const doctors: Doctor[] = [
    { id: "d1", name: "Dr. Sato" },
    { id: "d2", name: "Dr. Tanaka" },
  ];

  it("calls callbacks when selection changes", async () => {
    const user = userEvent.setup();
    const doctorSpy = vi.fn();
    const categorySpy = vi.fn();
    const startSpy = vi.fn();
    const endSpy = vi.fn();

    render(
      <Filters
        doctors={doctors}
        doctorId="d1"
        onDoctorChange={doctorSpy}
        category="all"
        onCategoryChange={categorySpy}
        startDate="2024-03-01"
        endDate="2024-03-07"
        onStartDateChange={startSpy}
        onEndDateChange={endSpy}
      />
    );

    await user.selectOptions(screen.getByLabelText("医師"), "d2");
    await user.selectOptions(screen.getByLabelText("カテゴリ"), "surgery");
    await user.clear(screen.getByLabelText("開始日"));
    await user.type(screen.getByLabelText("開始日"), "2024-03-02");
    await user.clear(screen.getByLabelText("終了日"));
    await user.type(screen.getByLabelText("終了日"), "2024-03-05");

    expect(doctorSpy).toHaveBeenCalledWith("d2");
    expect(categorySpy).toHaveBeenCalledWith("surgery");
    expect(startSpy).toHaveBeenLastCalledWith("2024-03-02");
    expect(endSpy).toHaveBeenLastCalledWith("2024-03-05");
  });
});
