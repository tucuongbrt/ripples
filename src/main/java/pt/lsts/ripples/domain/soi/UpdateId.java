package pt.lsts.ripples.domain.soi;

public class UpdateId {
    private String previousId;

    private String newId;

    /**
     * @return the previousId
     */
    public String getPreviousId() {
        return previousId;
    }

    /**
     * @return the newId
     */
    public String getNewId() {
        return newId;
    }

    /**
     * @param newId the newId to set
     */
    public void setNewId(String newId) {
        this.newId = newId;
    }

    /**
     * @param previousId the previousId to set
     */
    public void setPreviousId(String previousId) {
        this.previousId = previousId;
    }
}