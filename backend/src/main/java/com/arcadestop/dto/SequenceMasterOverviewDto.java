package com.arcadestop.dto;

public class SequenceMasterOverviewDto {

    private String browserId;
    private SequenceMasterRecordDto easy;
    private SequenceMasterRecordDto medium;
    private SequenceMasterRecordDto hard;

    public SequenceMasterOverviewDto() {
    }

    public SequenceMasterOverviewDto(String browserId, SequenceMasterRecordDto easy,
                                     SequenceMasterRecordDto medium, SequenceMasterRecordDto hard) {
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

    public SequenceMasterRecordDto getEasy() {
        return easy;
    }

    public void setEasy(SequenceMasterRecordDto easy) {
        this.easy = easy;
    }

    public SequenceMasterRecordDto getMedium() {
        return medium;
    }

    public void setMedium(SequenceMasterRecordDto medium) {
        this.medium = medium;
    }

    public SequenceMasterRecordDto getHard() {
        return hard;
    }

    public void setHard(SequenceMasterRecordDto hard) {
        this.hard = hard;
    }
}
