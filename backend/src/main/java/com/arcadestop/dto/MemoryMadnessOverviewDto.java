package com.arcadestop.dto;

public class MemoryMadnessOverviewDto {

    private String browserId;
    private MemoryMadnessRecordDto easy;
    private MemoryMadnessRecordDto medium;
    private MemoryMadnessRecordDto hard;

    public MemoryMadnessOverviewDto() {
    }

    public MemoryMadnessOverviewDto(String browserId, MemoryMadnessRecordDto easy,
                                   MemoryMadnessRecordDto medium, MemoryMadnessRecordDto hard) {
        this.browserId = browserId;
        this.easy = easy;
        this.medium = medium;
        this.hard = hard;
    }

    public String getBrowserId() {
        return browserId;
    }

    public void setBrowserId(String browserId) {
        this.browserId = browserId;
    }

    public MemoryMadnessRecordDto getEasy() {
        return easy;
    }

    public void setEasy(MemoryMadnessRecordDto easy) {
        this.easy = easy;
    }

    public MemoryMadnessRecordDto getMedium() {
        return medium;
    }

    public void setMedium(MemoryMadnessRecordDto medium) {
        this.medium = medium;
    }

    public MemoryMadnessRecordDto getHard() {
        return hard;
    }

    public void setHard(MemoryMadnessRecordDto hard) {
        this.hard = hard;
    }
}
