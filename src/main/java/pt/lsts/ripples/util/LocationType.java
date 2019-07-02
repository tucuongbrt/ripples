/*
 * Copyright (c) 2004-2019 Universidade do Porto - Faculdade de Engenharia
 * Laboratório de Sistemas e Tecnologia Subaquática (LSTS)
 * All rights reserved.
 * Rua Dr. Roberto Frias s/n, sala I203, 4200-465 Porto, Portugal
 *
 * This file is part of Neptus, Command and Control Framework.
 *
 * Commercial Licence Usage
 * Licencees holding valid commercial Neptus licences may use this file
 * in accordance with the commercial licence agreement provided with the
 * Software or, alternatively, in accordance with the terms contained in a
 * written agreement between you and Universidade do Porto. For licensing
 * terms, conditions, and further information contact lsts@fe.up.pt.
 *
 * Modified European Union Public Licence - EUPL v.1.1 Usage
 * Alternatively, this file may be used under the terms of the Modified EUPL,
 * Version 1.1 only (the "Licence"), appearing in the file LICENCE.md
 * included in the packaging of this file. You may not use this work
 * except in compliance with the Licence. Unless required by applicable
 * law or agreed to in writing, software distributed under the Licence is
 * distributed on an "AS IS" basis, WITHOUT WARRANTIES OR CONDITIONS OF
 * ANY KIND, either express or implied. See the Licence for the specific
 * language governing permissions and limitations at
 * https://github.com/LSTS/neptus/blob/develop/LICENSE.md
 * and http://ec.europa.eu/idabc/eupl.html.
 *
 * For more information please see <http://lsts.fe.up.pt/neptus>.
 *
 * Author: Paulo Dias, Ze Pinto, Renato Campos
 * 2005/03/05
 * 2019/02/08 (Version copied from 
 * https://github.com/LSTS/neptus/blob/develop/src/pt/lsts/neptus/types/coord/LocationType.java
 */
package pt.lsts.ripples.util;

/**
 * Some methods and properties were removed from the original location type
 * @author Renato Campos
 */
public class LocationType {

    protected static final String DEFAULT_ROOT_ELEMENT = "coordinate";

    public static final LocationType ABSOLUTE_ZERO = new LocationType();

    public static final LocationType FEUP = new LocationType(41.17785, -8.59796);
    
    public static double ONE_LAT_DEGREE = 0;
    static {
        LocationType lt = new LocationType();
        lt.setLatitudeDegs(1);
    }

    protected double latitudeRads = 0;
    protected double longitudeRads = 0;

    private double depth = 0;

    // spherical coordinates in degrees (º)
    protected double offsetDistance = 0;
    protected double azimuth = 0;
    protected double zenith = 90;

    // offsets are in meters (m)
    private boolean isOffsetNorthUsed = true;
    private double offsetNorth = 0;
    private boolean isOffsetEastUsed = true;
    private double offsetEast = 0;
    private boolean isOffsetUpUsed = true;
    private double offsetDown = 0;

    public LocationType() {
        super();
    }


    /**
     * @param anotherLocation
     */
    public LocationType(LocationType anotherLocation) {
        super();
        setLocation(anotherLocation);
    }

    public LocationType(double latitudeDegrees, double longitudeDegrees) {
        this.latitudeRads = Math.toRadians(latitudeDegrees);
        this.longitudeRads = Math.toRadians(longitudeDegrees);
    }

    /**
     * @return in decimal degrees
     */
    public double getLatitudeDegs() {
        return Math.toDegrees(latitudeRads);
    }

    /**
     * @return
     */
    public double getLatitudeRads() {
        return latitudeRads;
    }

    /**
     * @param latitude
     *            The latitude to set in decimal degrees.
     */
    public void setLatitudeDegs(double latitude) {
        setLatitudeRads(Math.toRadians(latitude));        
    }

    /**
     * @param latitudeRads
     *            The latitude to set in radians.
     */
    public void setLatitudeRads(double latitudeRads) {
        this.latitudeRads = latitudeRads;
    }

    /**
     * @return in decimal degrees
     */
    public double getLongitudeDegs() {
        return Math.toDegrees(this.longitudeRads);
    }

    /**
     * @return
     */
    public double getLongitudeRads() {
        return longitudeRads;
    }

    /**
     * @param longitude
     *            The longitude to set in decimal degrees.
     */
    public void setLongitudeDegs(double longitude) {
        setLongitudeRads(Math.toRadians(longitude));
    }

    /**
     * @param longitudeRads
     *            The longitude to set in radians.
     */
    public void setLongitudeRads(double longitudeRads) {
        this.longitudeRads = longitudeRads;
    }

    /**
     * @return Returns the z value. 
     * @see #getZUnits()
     */
    public double getDepth() {
        if (depth == 0)
            return 0;
        return depth;
    }

    /**
     * @param depth The value for depth
     */
    public void setDepth(double depth) {
        this.depth = depth;
    }

    /**
     * @return Returns the height.
     */
    public double getHeight() {
        return -getDepth();
    }

    /**
     * @param height
     *            The height to set.
     */
    public void setHeight(double height) {
        this.depth = -height;
    }

    /**
     * @return Returns the offsetDistance.
     */
    public double getOffsetDistance() {
        return offsetDistance;
    }

    /**
     * @param offsetDistance
     *            The offsetDistance to set.
     */
    public void setOffsetDistance(double offsetDistance) {
        this.offsetDistance = offsetDistance;
    }

    /**
     * @return Returns the azimuth.
     */
    public double getAzimuth() {
        return azimuth;
    }

    /**
     * @param azimuth
     *            The azimuth to set.
     */
    public void setAzimuth(double azimuth) {
        this.azimuth = azimuth;
    }

    /**
     * @return Returns the zenith.
     */
    public double getZenith() {
        return zenith;
    }

    /**
     * @param zenith
     *            The zenith to set.
     */
    public void setZenith(double zenith) {
        this.zenith = zenith;
    }

    /**
     * @return Returns the offsetNorth.
     */
    public double getOffsetNorth() {
        return offsetNorth;
    }

    /**
     * @param offsetNorth
     *            The offsetNorth to set.
     */
    public void setOffsetNorth(double offsetNorth) {
        this.offsetNorth = offsetNorth;
    }

    /**
     * @param offsetNorth
     *            The offsetNorth to set.
     * @param useOffsetNorthInXMLOutput
     *            updates the {@link #isOffsetNorthUsed()}.
     */
    public void setOffsetNorth(double offsetNorth, boolean useOffsetNorthInXMLOutput) {
        setOffsetNorth(offsetNorth);
        setOffsetNorthUsed(useOffsetNorthInXMLOutput);
    }

    /**
     * @return Returns the offsetSouth.
     */
    public double getOffsetSouth() {
        if (this.offsetNorth == 0)
            return offsetNorth;
        else
            return -offsetNorth;
    }

    /**
     * @param offsetSouth
     *            The offsetSouth to set.
     */
    public void setOffsetSouth(double offsetSouth) {
        this.offsetNorth = -offsetSouth;
        if (this.offsetNorth == 0)
            this.offsetNorth = 0;
    }

    /**
     * @param offsetNorth
     *            The offsetNorth to set.
     * @param useOffsetSouthInXMLOutput
     *            updates the {@link #isOffsetNorthUsed()}.
     */
    public void setOffsetSouth(double offsetSouth, boolean useOffsetSouthInXMLOutput) {
        setOffsetSouth(offsetSouth);
        setOffsetNorthUsed(!useOffsetSouthInXMLOutput);
    }

    /**
     * @return Returns the offsetEast.
     */
    public double getOffsetEast() {
        return offsetEast;
    }

    /**
     * @param offsetEast
     *            The offsetEast to set.
     */
    public void setOffsetEast(double offsetEast) {
        this.offsetEast = offsetEast;
    }

    /**
     * @param offsetEast
     *            The offsetEast to set.
     * @param useOffsetEastInXMLOutput
     *            updates the {@link #isOffsetEastUsed()}.
     */
    public void setOffsetEast(double offsetEast, boolean useOffsetEastInXMLOutput) {
        setOffsetEast(offsetEast);
        setOffsetEastUsed(useOffsetEastInXMLOutput);
    }

    /**
     * @return Returns the offsetWest.
     */
    public double getOffsetWest() {
        if (this.offsetEast == 0)
            return offsetEast;
        else
            return -offsetEast;
    }

    /**
     * @param offsetWest
     *            The offsetWest to set.
     */
    public void setOffsetWest(double offsetWest) {
        this.offsetEast = -offsetWest;
        if (this.offsetEast == 0)
            this.offsetEast = 0;
    }

    /**
     * @param offsetWest
     *            The offsetWest to set.
     * @param useOffsetWestInXMLOutput
     *            updates the {@link #isOffsetEastUsed()}.
     */
    public void setOffsetWest(double offsetWest, boolean useOffsetWestInXMLOutput) {
        setOffsetWest(offsetWest);
        setOffsetEastUsed(!useOffsetWestInXMLOutput);
    }

    /**
     * @return Returns the offsetUp.
     */
    public double getOffsetUp() {
        if (this.offsetDown == 0)
            return this.offsetDown;
        else
            return -this.offsetDown;
    }

    /**
     * @param offsetUp
     *            The offsetUp to set.
     */
    public void setOffsetUp(double offsetUp) {
        this.offsetDown = -offsetUp;
        if (this.offsetDown == 0)
            this.offsetDown = 0;
    }

    /**
     * @param offsetUp
     *            The offsetUp to set.
     * @param useOffsetUpInXMLOutput
     *            updates the {@link #isOffsetUpUsed()}.
     */
    public void setOffsetUp(double offsetUp, boolean useOffsetUpInXMLOutput) {
        setOffsetUp(offsetUp);
        setOffsetUpUsed(useOffsetUpInXMLOutput);
    }

    /**
     * @return Returns the offsetDown.
     */
    public double getOffsetDown() {
        return offsetDown;
    }

    /**
     * @param offsetDown
     *            The offsetDown to set.
     */
    public void setOffsetDown(double offsetDown) {
        this.offsetDown = offsetDown;
    }

    /**
     * @param offsetDown
     *            The offsetDown to set.
     * @param useOffsetDownInXMLOutput
     *            updates the {@link #isOffsetUpUsed()}.
     */
    public void setOffsetDown(double offsetDown, boolean useOffsetDownInXMLOutput) {
        setOffsetDown(offsetDown);
        setOffsetUpUsed(!useOffsetDownInXMLOutput);
    }

    /**
     * @return Returns the isOffsetEastUsed.
     */
    public boolean isOffsetEastUsed() {
        return isOffsetEastUsed;
    }

    /**
     * @param isOffsetEastUsed
     *            The isOffsetEastUsed to set.
     */
    public void setOffsetEastUsed(boolean isOffsetEastUsed) {
        this.isOffsetEastUsed = isOffsetEastUsed;
    }

    /**
     * @return Returns the isOffsetNorthUsed.
     */
    public boolean isOffsetNorthUsed() {
        return isOffsetNorthUsed;
    }

    /**
     * @param isOffsetNorthUsed
     *            The isOffsetNorthUsed to set.
     */
    public void setOffsetNorthUsed(boolean isOffsetNorthUsed) {
        this.isOffsetNorthUsed = isOffsetNorthUsed;
    }

    /**
     * @return Returns the isOffsetUpUsed.
     */
    public boolean isOffsetUpUsed() {
        return isOffsetUpUsed;
    }

    /**
     * @param isOffsetUpUsed
     *            The isOffsetUpUsed to set.
     */
    public void setOffsetUpUsed(boolean isOffsetUpUsed) {
        this.isOffsetUpUsed = isOffsetUpUsed;
    }


    /**
     * This method gives a vector from otherLocation to this location
     * 
     * @param otherLocation
     * @return
     */
    public double[] getOffsetFrom(LocationType otherLocation) {
        return CoordinateUtil.WGS84displacement(otherLocation, this);
    }
    
    /**
     * Converts this Location to absolute (Lat/Lon/Depth without offsets). 
     * @return The Location itself. 
     */
    @SuppressWarnings("unchecked")
    public <L extends LocationType> L convertToAbsoluteLatLonDepth() {
        if (offsetNorth == 0 && offsetEast == 0 && offsetDown == 0 && offsetDistance == 0) {
            return (L) this;
        }
        
        double latlondepth[] = getAbsoluteLatLonDepth();

        setLocation(ABSOLUTE_ZERO);
        setLatitudeDegs(latlondepth[0]);
        setLongitudeDegs(latlondepth[1]);
        setDepth(latlondepth[2]);

        return (L) this;
    }
    
    /**
     * 
     * @return The total Lat(degrees), Lon(degrees) and Depth(m)
     */
    public double[] getAbsoluteLatLonDepth() {
        double[] totalLatLonDepth = new double[] { 0d, 0d, 0d };
        totalLatLonDepth[0] = getLatitudeDegs();
        totalLatLonDepth[1] = getLongitudeDegs();
        totalLatLonDepth[2] = getDepth();

        double[] tmpDouble = CoordinateUtil.sphericalToCartesianCoordinates(getOffsetDistance(),
                getAzimuth(), getZenith());
        double north = getOffsetNorth() + tmpDouble[0];
        double east = getOffsetEast() + tmpDouble[1];
        double down = getOffsetDown() + tmpDouble[2];

        if (north != 0.0 || east != 0.0 || down != 0.0)
            return CoordinateUtil.WGS84displace(totalLatLonDepth[0],totalLatLonDepth[1], totalLatLonDepth[2], north, east, down);
        else
            return totalLatLonDepth;
    }

    @SuppressWarnings("unchecked")
	public <L extends LocationType> L getNewAbsoluteLatLonDepth() {
        double latlondepth[] = getAbsoluteLatLonDepth();
        L loc;
        try {
            loc = (L) this.getClass().newInstance();
        }
        catch (Exception e) {
            loc = (L) new LocationType();
        }
        loc.setLatitudeDegs(latlondepth[0]);
        loc.setLongitudeDegs(latlondepth[1]);
        loc.setDepth(latlondepth[2]);

        return loc;
    }
    
    /**
     * Copies the given location to this one. (Does not link them together.)
     * @param anotherPoint
     */
    public void setLocation(LocationType anotherPoint) {
        if (anotherPoint == null)
            return;

        this.setLatitudeRads(anotherPoint.getLatitudeRads());
        this.setLongitudeRads(anotherPoint.getLongitudeRads());
        this.setDepth(anotherPoint.getDepth());

        this.setAzimuth(anotherPoint.getAzimuth());
        this.setZenith(anotherPoint.getZenith());
        this.setOffsetDistance(anotherPoint.getOffsetDistance());

        this.setOffsetDown(anotherPoint.getOffsetDown());
        this.setOffsetEast(anotherPoint.getOffsetEast());
        this.setOffsetNorth(anotherPoint.getOffsetNorth());

        this.setOffsetEastUsed(anotherPoint.isOffsetEastUsed());
        this.setOffsetNorthUsed(anotherPoint.isOffsetNorthUsed());
        this.setOffsetUpUsed(anotherPoint.isOffsetUpUsed());
    }

    /**
     * Translate this location by the offsets.
     * @param offsetNorth
     * @param offsetEast
     * @param offsetDown
     * @return This location.
     */
    @SuppressWarnings("unchecked")
    public <L extends LocationType> L translatePosition(double offsetNorth, double offsetEast,
            double offsetDown) {

        setOffsetNorth(getOffsetNorth() + offsetNorth);
        setOffsetEast(getOffsetEast() + offsetEast);
        setOffsetDown(getOffsetDown() + offsetDown);

        return (L) this;
    }

    /**
     * This calls {@link #translatePosition(double, double, double)}.
     * @param nedOffsets
     * @return This location.
     */
    @SuppressWarnings("unchecked")
    public <L extends LocationType> L translatePosition(double[] nedOffsets) {
        if (nedOffsets.length < 3) {
            return (L) this;
        }
        return translatePosition(nedOffsets[0], nedOffsets[1], nedOffsets[2]);
    }



    /**
     * Sets both z and down offsets to zero.
     */
    protected void makeTotalDepthZero() {
        setDepth(0);
        setOffsetDown(0);
        setOffsetDistance(0);
        setAzimuth(0);
        setZenith(90);
    }

    /**
     * Calls {@link #makeTotalDepthZero()} and then sets the value of depth to the given value
     * 
     * @param depth
     */
    public void setAbsoluteDepth(double z) {
        makeTotalDepthZero();
        setDepth(z);
    }



}