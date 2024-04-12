/**
 * An interface that all models implement.
 */
export interface IModel {

    /**
     * Saves this instance to the database.
     */
    save(): Promise<void>;
}