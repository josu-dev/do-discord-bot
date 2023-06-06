import { APIEmbed, bold, hyperlink, italic } from 'discord.js';


export type StudentGroupsNames = 'franjamorada' | 'lafuente' | 'codigorojo';

export type StudentGroup<N extends StudentGroupsNames> = {
    name: N,
    displayName: string,
    studentCenter: boolean;
    color: number;
    officialSite?: string;
    shortDesc?: string;
    socials: {
        social: string,
        displayName: string,
        url: string,
    }[];
};

export const studentGroups: Map<StudentGroupsNames, StudentGroup<StudentGroupsNames>> = new Map([
    [`franjamorada`, {
        name: `franjamorada`,
        displayName: `Franja Morada`,
        studentCenter: true,
        color: 0x451e55,
        officialSite: `https://franjainfounlp.ar/`,
        socials: [
            {
                social: `Instagram`,
                displayName: `Franja Morada Informática UNLP`,
                url: `https://www.instagram.com/fminformaticaunlp/`,
            },
            {
                social: `Facebook`,
                displayName: `Franja Morada Informática UNLP`,
                url: `https://www.facebook.com/FranjaMoradaInformaticaUNLP`,
            },
            {
                social: `Youtube`,
                displayName: `Franja Morada Informática UNLP`,
                url: `https://www.youtube.com/channel/UCcTitQEjDq712HoQ0oDYDow`,
            }
        ]
    }],
    [`lafuente`, {
        name: `lafuente`,
        displayName: `La Fuente`,
        studentCenter: false,
        color: 0xef6c00,
        officialSite: `https://lafuenteunlp.com.ar/`,
        shortDesc: `Por una universidad nacional y popular ✌`,
        socials: [
            {
                social: `Facebook`,
                displayName: `La Fuente Informática - UNLP`,
                url: `https://www.facebook.com/LaFuenteUNLP`,
            },
            {
                social: `Instagram`,
                displayName: `La Fuente Informática - UNLP`,
                url: `https://www.instagram.com/lafuenteunlp/`,
            },
            {
                social: `Youtube`,
                displayName: `La Fuente Informática UNLP`,
                url: `https://www.youtube.com/@LaFuenteunlp`,
            }
        ]
    }],
    [`codigorojo`, {
        name: `codigorojo`,
        displayName: `Codigo Rojo`,
        studentCenter: false,
        color: 0xa10a03,
        officialSite: `https://linktr.ee/encodigorojo`,
        shortDesc: `La Izquierda en Informática - #UNLP`,
        socials: [
            {
                social: `Facebook`,
                displayName: `La izquierda en informática`,
                url: `https://www.facebook.com/encodigorojo`,
            },
            {
                social: `Instagram`,
                displayName: `En Código Rojo`,
                url: `https://www.instagram.com/encodigorojo/`,
            },
        ]
    }],
]);


export function embedFromStudentGroup(studentGroup: StudentGroup<StudentGroupsNames>) {
    const embed: APIEmbed = {
        title: studentGroup.displayName,
        description: ``,
        color: studentGroup.color,
    };

    if (studentGroup.officialSite) {
        embed.url = studentGroup.officialSite;
    }
    if (studentGroup.studentCenter) {
        embed.description = `Actual conducción del Centro de Estudiantes de la Facultad de Informática UNLP\n`;
    }
    if (studentGroup.shortDesc) {
        embed.description += `${studentGroup.shortDesc}`;
    }

    embed.fields = [];
    for (const social of studentGroup.socials) {
        embed.fields.push({
            name: social.social,
            value: `${hyperlink(social.displayName, social.url)}`,
            inline: true
        });
    }

    return embed;
}


export const studenGroupsEmbeds = new Map<StudentGroupsNames, APIEmbed>();
for (const [name, studentGroup] of studentGroups) {
    studenGroupsEmbeds.set(name, embedFromStudentGroup(studentGroup));
}
