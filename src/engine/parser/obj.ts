export interface ObjModel {
    vertices: number[][];
    normals: number[][];
    uvs: number[][];
    faces: {
        vertexIndices: number[];
        uvIndices?: number[];
        normalIndices?: number[];
    }[];
}


export function parseOBJ(objText: string) {
    const vertices: number[][] = [];
    const uvs: number[][] = [];
    const normals: number[][] = [];
    const faces: {
        vertexIndices: number[];
        uvIndices: number[];
        normalIndices: number[];
    }[] = [];

    const lines = objText.split("\n");

    for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length === 0) continue;

        switch (parts[0]) {
            case "v":
                vertices.push(parts.slice(1).map(Number));
                break;
            case "vt":
                uvs.push(parts.slice(1).map(Number));
                break;
            case "vn":
                normals.push(parts.slice(1).map(Number));
                break;
            case "f":
                const vertexIndices: number[] = [];
                const uvIndices: number[] = [];
                const normalIndices: number[] = [];

                for (let i = 1; i < parts.length; i++) {
                    const [v, vt, vn] = parts[i].split("/").map((x) => (x ? parseInt(x) - 1 : undefined));
                    if (v !== undefined) vertexIndices.push(v);
                    if (vt !== undefined) uvIndices.push(vt);
                    if (vn !== undefined) normalIndices.push(vn);
                }

                faces.push({ vertexIndices, uvIndices, normalIndices });
                break;
        }
    }

    return { vertices, uvs, normals, faces };
}
