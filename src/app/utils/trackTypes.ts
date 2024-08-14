export const trackTypes = {
    TEST_TRACK: {
        dataFields: {}
    },
    CONSUMED_WATER: {
        title: 'Water',
        dataFields: {
            litresProduct: Number
        }
    },
    CONSUMED_ALCOHOL: {
        title: 'Alcohol',
        dataFields: {
            litresProduct: Number,
            alcoholPercentage: Number
        }
    },
    CONSUMED_FOOD: {
        title: 'Food',
        dataFields: {
            gramsProduct: Number,
            caloriesTotal: Number
        }
    },
    CONSUMED_CAFFEINE: {
        title: 'Caffeine',
        dataFields: {
            gramsProduct: Number,
            gramsCaffeine: Number
        }
    },
    CONSUMED_CIGARETTE: {
        title: 'Cigarette',
        dataFields: {
            gramsProduct: Number,
            gramsNicotine: Number
        }
    },
    CONSUMED_SNUFF: {
        title: 'Snuff',
        dataFields: {
            gramsProduct: Number,
            gramsNicotine: Number
        }
    },
    EXCRETED_URINE: {
        title: 'Urine',
        dataFields: {
            litres: Number
        }
    },
    EXCRETED_FECES: {
        title: 'Feces',
        dataFields: {
            grams: Number
        }
    },
    EXCRETED_VOMIT: {
        title: 'Vomit',
        dataFields: {
            litres: Number,
            forced: Boolean
        }
    },
    HAIRCUT: {
        title: 'Haircut',
        dataFields: {
            metersCut: Number,
            professional: Boolean
        }
    },
    BLOW_NOSE: {
        title: 'Blow nose',
        dataFields: {}
    },
    BRUSH_TEETH: {
        title: 'Brush teeth',
        dataFields: {}
    },
    SHOWER: {
        title: 'Shower',
        dataFields: {
            temperature: Number,
            liters: Number,
            tub: Boolean
        }
    },
    SHAVE: {
        title: 'Shave',
        dataFields: {
            centimetersCut: Number,
            professional: Boolean
        }
    },
    HEARTACHE: {
        title: 'Heartache',
        dataFields: {}
    },
    HEADACHE: {
        title: 'Headache',
        dataFields: {}
    },
    MASTURBATE: {
        title: 'Masturbate',
        dataFields: {
            orgasm: Number,
            mutual: Boolean
        }
    },
    SEX: {
        title: 'Sex',
        dataFields: {
            youOrgasm: Number,
            theyOrgasm: Number
        }
    },
    CLIP_NAILS: {
        title: 'Clipped Nails',
        dataFields: {
            cutCentimeters: Number
        }
    },
    COOKING: {
        title: 'Cooking',
        dataFields: {}
    },
    CLEANING: {
        title: 'Cleaning',
        dataFields: {}
    },
    FART: {
        title: 'Farted',
        dataFields: {}
    },
    POP_ZIT: {
        title: 'Popped Zit',
        dataFields: {
            resqueeze: Boolean // Popped this zit before?
        }
    },
    WAKEUP_EARWORM: {
        title: 'Wakeup Earworm',
        dataFields: {
            title: String,
            album: String,
            artist: String,
            spotifyURL: String
        }
    },
    FEELING_SICK: {
        title: 'Feeling Sick',
        dataFields: {}
    },
    TINNITUS: {
        title: 'Tinnitus',
        dataFields: {
            highPitch: Boolean
        }
    },
    WORKOUT: {
        title: 'Workout',
        dataFields: {
            caloriesBurned: Number
        }
    }
} as const
